'use server';

/**
 * Server actions for the generic discount-code system.
 *
 *   validateDiscountCode  — read-only check; safe to call from any UI
 *                           to show inline feedback as the user types.
 *   redeemDiscountCode    — atomic redemption: creates a redemption
 *                           record, increments the global counter on
 *                           the code, and writes a snapshot grant onto
 *                           the user doc. Does NOT touch Stripe for
 *                           free-access codes.
 *   getActiveAccessGrant  — fetch the user's current snapshot grant.
 *   listDiscountCodes /
 *   createDiscountCode /
 *   setDiscountCodeActive /
 *   listRedemptionsForCode — admin operations.
 *
 * IMPORTANT — billing safety:
 *   For free-access codes (free_access, comped, pilot, beta, institution,
 *   promotional) we never create a Stripe customer or subscription. The
 *   user gets an internal grant that expires lazily. There is no Stripe
 *   object that could later be billed. See `docs/DISCOUNT_CODES.md`.
 *
 *   Stripe-flow codes (percent_off / amount_off) carry a Stripe promotion
 *   code id and are intended to be applied at Checkout — they are NOT
 *   redeemed here; the regular checkout flow already supports
 *   `allow_promotion_codes: true`. This file is for the *internal* grant
 *   path; Stripe-flow codes are stored here for inventory but the
 *   `redeemDiscountCode` action will reject them with a clear message.
 */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  Timestamp,
  runTransaction,
  orderBy,
  limit as fbLimit,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { requireAdmin, isUserAdmin } from '@/lib/admin';
import type {
  DiscountCode,
  DiscountCodeAccessScope,
  DiscountCodeRedemption,
  DiscountCodeType,
  UserAccessGrant,
} from '@/types';
import {
  buildAccessGrant,
  buildRedemptionSuccessMessage,
  computeAccessExpiration,
  isFreeAccessType,
  isGrantActive,
  normalizeCode,
  validateForRedemption,
  type ValidationFailureReason,
} from '@/lib/discount-codes';

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; reason?: ValidationFailureReason };

/**
 * Read a `DiscountCode` document by its normalized code text. Returns
 * null when no such code exists. The `code` field on the document is
 * always stored uppercased to make the lookup deterministic.
 */
async function findCodeByText(code: string): Promise<DiscountCode | null> {
  const normalized = normalizeCode(code);
  if (!normalized) return null;
  const q = query(
    collection(db, 'discountCodes'),
    where('code', '==', normalized),
    fbLimit(1),
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const docSnap = snap.docs[0];
  return { id: docSnap.id, ...(docSnap.data() as Omit<DiscountCode, 'id'>) };
}

/**
 * Has this user already redeemed this code?
 */
async function userHasRedeemed(uid: string, discountCodeId: string): Promise<boolean> {
  const q = query(
    collection(db, 'discountCodeRedemptions'),
    where('userId', '==', uid),
    where('discountCodeId', '==', discountCodeId),
    fbLimit(1),
  );
  const snap = await getDocs(q);
  return !snap.empty;
}

/**
 * Validate a code on behalf of a user without modifying state. Used by
 * the redemption UI to show inline feedback before the user clicks
 * "Apply". The same validator runs inside the transaction in
 * `redeemDiscountCode` so this can never go out of sync.
 */
export async function validateDiscountCode(input: {
  code: string;
  uid?: string;
}): Promise<
  ActionResult<{
    discountCodeId: string;
    name: string;
    description?: string;
    accessScope: DiscountCodeAccessScope;
    accessType: DiscountCodeType;
    courseName?: string;
    platformName?: string;
    accessExpiresAt: string | null;
    requiresStripe: boolean;
    isFreeAccess: boolean;
  }>
> {
  try {
    const code = await findCodeByText(input.code);
    let alreadyRedeemed = false;
    if (input.uid && code) {
      alreadyRedeemed = await userHasRedeemed(input.uid, code.id);
    }
    const result = validateForRedemption({
      code,
      now: new Date(),
      userAlreadyRedeemed: alreadyRedeemed,
    });
    if (!result.ok) {
      return { success: false, error: result.message, reason: result.reason };
    }
    return {
      success: true,
      data: {
        discountCodeId: result.code.id,
        name: result.code.name,
        description: result.code.description,
        accessScope: result.code.accessScope,
        accessType: result.code.discountType,
        courseName: result.code.courseName,
        platformName: result.code.platformName,
        accessExpiresAt: result.expiresAt ? result.expiresAt.toISOString() : null,
        requiresStripe: result.code.requiresStripe === true,
        isFreeAccess: isFreeAccessType(result.code.discountType),
      },
    };
  } catch (err) {
    console.error('[discount-codes] validateDiscountCode error:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
      reason: 'unknown',
    };
  }
}

/**
 * Redeem a code for the given user. Atomic w.r.t. the
 * `discountCodes/{id}` document — the redemption count is bumped in the
 * same transaction that creates the redemption record, so race
 * conditions on `maxRedemptions` are impossible.
 *
 * For free-access codes (the common case here), this:
 *   1. Creates `discountCodeRedemptions/{newId}` with the access window
 *   2. Increments `redemptionCount` on the code doc
 *   3. Writes `activeAccessGrant` snapshot onto `users/{uid}`
 *
 * It does NOT touch Stripe. No customer, no subscription, no payment
 * method. There is therefore nothing for Stripe to bill at any point.
 *
 * For Stripe-flow codes (percent_off / amount_off) this returns an
 * error directing the caller to use the regular Stripe Checkout flow
 * with the promotion code applied there.
 */
export async function redeemDiscountCode(input: {
  uid: string;
  email?: string | null;
  code: string;
}): Promise<
  ActionResult<{
    redemption: DiscountCodeRedemption;
    grant: UserAccessGrant;
    successMessage: string;
  }>
> {
  if (!input.uid) {
    return { success: false, error: 'You must be signed in to redeem a discount code.' };
  }
  const normalized = normalizeCode(input.code);
  if (!normalized) {
    return {
      success: false,
      error: 'This discount code is not valid. Please check the code and try again.',
      reason: 'not_found',
    };
  }

  try {
    const codeBefore = await findCodeByText(normalized);
    if (!codeBefore) {
      return {
        success: false,
        error: 'This discount code is not valid. Please check the code and try again.',
        reason: 'not_found',
      };
    }
    if (!isFreeAccessType(codeBefore.discountType)) {
      // Stripe-flow codes must go through Checkout — using a promo code
      // here would be a category error and could create a paid object.
      return {
        success: false,
        error:
          'This discount code applies to a paid plan. Please continue to checkout and enter the code there.',
        reason: 'unknown',
      };
    }

    // Pre-check redemption (outside the transaction). The transaction
    // re-checks atomically, but this catches the easy cases and keeps
    // the transaction short.
    const alreadyRedeemed = await userHasRedeemed(input.uid, codeBefore.id);
    const preCheck = validateForRedemption({
      code: codeBefore,
      now: new Date(),
      userAlreadyRedeemed: alreadyRedeemed,
    });
    if (!preCheck.ok) {
      return { success: false, error: preCheck.message, reason: preCheck.reason };
    }

    const now = new Date();
    const expiresAt = computeAccessExpiration(codeBefore, now);
    if (!expiresAt) {
      // Defensive — validateForRedemption should have caught this.
      return {
        success: false,
        error: 'This discount code is not valid. Please check the code and try again.',
        reason: 'no_duration',
      };
    }

    // Atomic: re-read the code, re-validate, bump the counter, write
    // the redemption + grant in a single transaction.
    const codeRef = doc(db, 'discountCodes', codeBefore.id);
    const redemptionId = await runTransaction(db, async (tx) => {
      const fresh = await tx.get(codeRef);
      if (!fresh.exists()) {
        throw new Error('not_found');
      }
      const freshData = { id: fresh.id, ...(fresh.data() as Omit<DiscountCode, 'id'>) };
      // Re-validate inside the transaction with the freshest counter.
      const txCheck = validateForRedemption({
        code: freshData,
        now: new Date(),
        userAlreadyRedeemed: alreadyRedeemed,
      });
      if (!txCheck.ok) {
        // Rethrow as a tagged error the outer try/catch unpacks.
        throw new Error(`reason:${txCheck.reason}:${txCheck.message}`);
      }
      const newRedemptionRef = doc(collection(db, 'discountCodeRedemptions'));
      const redemptionDoc: Omit<DiscountCodeRedemption, 'id'> = {
        discountCodeId: freshData.id,
        code: freshData.code,
        userId: input.uid,
        userEmail: input.email ?? undefined,
        redeemedAt: serverTimestamp(),
        accessStartsAt: Timestamp.fromDate(now),
        accessExpiresAt: Timestamp.fromDate(expiresAt),
        accessScope: freshData.accessScope,
        accessType: freshData.discountType,
        courseName: freshData.courseName,
        platformName: freshData.platformName,
        metadata: {
          codeName: freshData.name,
        },
        createdAt: serverTimestamp(),
      };
      tx.set(newRedemptionRef, redemptionDoc);
      tx.update(codeRef, {
        redemptionCount: (freshData.redemptionCount ?? 0) + 1,
        updatedAt: serverTimestamp(),
      });
      return newRedemptionRef.id;
    });

    // Build and write the snapshot grant onto the user doc. We do this
    // OUTSIDE the transaction because the redemption is the source of
    // truth; the snapshot is a denormalized read-optimization. If this
    // write fails (e.g. rules), the redemption still exists — the user
    // can be reconciled by re-running activation.
    const grant = buildAccessGrant({
      redemption: {
        id: redemptionId,
        discountCodeId: codeBefore.id,
        code: codeBefore.code,
        accessScope: codeBefore.accessScope,
        courseName: codeBefore.courseName,
        platformName: codeBefore.platformName,
      },
      accessStartsAt: now,
      accessExpiresAt: expiresAt,
    });

    const userRef = doc(db, 'users', input.uid);
    const userSnap = await getDoc(userRef);
    const userUpdate = {
      activeAccessGrant: {
        ...grant,
        accessStartsAt: Timestamp.fromDate(now),
        accessExpiresAt: Timestamp.fromDate(expiresAt),
      },
      onboardingComplete: true,
      lastUpdated: serverTimestamp(),
    };
    if (userSnap.exists()) {
      await updateDoc(userRef, userUpdate);
    } else {
      // Rare: redemption fired before the user profile doc was created
      // (during a race with createUserProfile). Merge-create so we
      // don't lose the grant.
      await setDoc(
        userRef,
        {
          uid: input.uid,
          email: input.email ?? null,
          ...userUpdate,
          createdAt: serverTimestamp(),
        },
        { merge: true },
      );
    }

    const successMessage = buildRedemptionSuccessMessage({
      platformName: codeBefore.platformName ?? 'Off World Clause',
      courseName: codeBefore.courseName,
      accessExpiresAt: expiresAt,
    });

    // Reload the redemption (for the dates it computed server-side).
    const reloadedSnap = await getDoc(doc(db, 'discountCodeRedemptions', redemptionId));
    const reloaded = reloadedSnap.exists()
      ? ({ id: reloadedSnap.id, ...(reloadedSnap.data() as Omit<DiscountCodeRedemption, 'id'>) } as DiscountCodeRedemption)
      : ({
          id: redemptionId,
          discountCodeId: codeBefore.id,
          code: codeBefore.code,
          userId: input.uid,
          userEmail: input.email ?? undefined,
          redeemedAt: now,
          accessStartsAt: now,
          accessExpiresAt: expiresAt,
          accessScope: codeBefore.accessScope,
          accessType: codeBefore.discountType,
          courseName: codeBefore.courseName,
          platformName: codeBefore.platformName,
          createdAt: now,
        } as DiscountCodeRedemption);

    return {
      success: true,
      data: {
        redemption: reloaded,
        grant,
        successMessage,
      },
    };
  } catch (err) {
    const raw = err instanceof Error ? err.message : String(err);
    // Unpack the tagged reason from inside the transaction.
    const tagged = /^reason:([a-z_]+):(.*)$/.exec(raw);
    if (tagged) {
      return {
        success: false,
        reason: tagged[1] as ValidationFailureReason,
        error: tagged[2],
      };
    }
    if (raw === 'not_found') {
      return {
        success: false,
        reason: 'not_found',
        error: 'This discount code is not valid. Please check the code and try again.',
      };
    }
    console.error('[discount-codes] redeemDiscountCode error:', err);
    return { success: false, error: raw, reason: 'unknown' };
  }
}

/**
 * Fetch the current snapshot grant from the user doc. Returns null
 * when there is no grant or when the grant has lapsed (in which case
 * we also clear the stale snapshot so the entitlement check sees the
 * accurate state immediately, not on next write).
 */
export async function getActiveAccessGrant(uid: string): Promise<ActionResult<UserAccessGrant | null>> {
  try {
    if (!uid) return { success: true, data: null };
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) return { success: true, data: null };
    const data = snap.data();
    const raw = data.activeAccessGrant as UserAccessGrant | undefined;
    if (!raw) return { success: true, data: null };
    if (isGrantActive(raw)) return { success: true, data: raw };
    // Grant expired — clear the snapshot so /onboarding/banners/access
    // checks all agree. This is a NO-OP for Stripe billing; we never
    // created a Stripe object for this grant.
    try {
      await updateDoc(userRef, {
        activeAccessGrant: null,
        lastUpdated: serverTimestamp(),
      });
    } catch (err) {
      console.warn('[discount-codes] could not clear expired grant:', err);
    }
    return { success: true, data: null };
  } catch (err) {
    console.error('[discount-codes] getActiveAccessGrant error:', err);
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

// ─── Admin operations ──────────────────────────────────────────────

/**
 * List all discount codes. Admin-only. Newest first.
 */
export async function listDiscountCodes(
  uid: string,
): Promise<ActionResult<DiscountCode[]>> {
  try {
    if (!(await isUserAdmin(uid))) {
      return { success: false, error: 'Unauthorized.' };
    }
    const snap = await getDocs(
      query(collection(db, 'discountCodes'), orderBy('createdAt', 'desc')),
    );
    const codes = snap.docs.map(
      (d) => ({ id: d.id, ...(d.data() as Omit<DiscountCode, 'id'>) }) as DiscountCode,
    );
    return { success: true, data: codes };
  } catch (err) {
    console.error('[discount-codes] listDiscountCodes error:', err);
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export interface CreateDiscountCodeInput {
  adminUid: string;
  code: string;
  name: string;
  description?: string;
  discountType: DiscountCodeType;
  accessScope: DiscountCodeAccessScope;
  courseName?: string;
  platformName?: string;
  accessDurationMonths?: number;
  accessDurationDays?: number;
  percentOff?: number;
  amountOff?: number;
  currency?: string;
  maxRedemptions?: number | null;
  oneUsePerUser?: boolean;
  requiresStripe?: boolean;
  stripeCouponId?: string;
  stripePromotionCodeId?: string;
  startsAt?: Date | null;
  expiresAt?: Date | null;
  isActive?: boolean;
}

/**
 * Create a new discount code. Admin-only. Enforces:
 *  - Codes are unique (case-insensitive).
 *  - Free-access codes must have a duration (months or days) OR a fixed
 *    `expiresAt`; otherwise validateForRedemption would always fail.
 *  - Stripe-flow codes (percent_off / amount_off) must carry the Stripe
 *    promotion code id so we know what to apply at Checkout.
 */
export async function createDiscountCode(
  input: CreateDiscountCodeInput,
): Promise<ActionResult<DiscountCode>> {
  try {
    await requireAdmin(input.adminUid);
    const normalized = normalizeCode(input.code);
    if (!normalized) {
      return { success: false, error: 'Code text is required.' };
    }

    const existing = await findCodeByText(normalized);
    if (existing) {
      return { success: false, error: `A discount code with text "${normalized}" already exists.` };
    }

    const isFree = isFreeAccessType(input.discountType);
    const hasDuration =
      (typeof input.accessDurationMonths === 'number' && input.accessDurationMonths > 0) ||
      (typeof input.accessDurationDays === 'number' && input.accessDurationDays > 0) ||
      !!input.expiresAt;
    if (isFree && !hasDuration) {
      return {
        success: false,
        error:
          'Free-access codes require a duration (months or days) or a fixed expiration date.',
      };
    }

    if (!isFree && input.requiresStripe && !input.stripePromotionCodeId) {
      return {
        success: false,
        error:
          'Stripe-flow codes require a stripePromotionCodeId so the discount can be applied at Checkout.',
      };
    }

    const docData: Omit<DiscountCode, 'id'> = {
      code: normalized,
      name: input.name,
      description: input.description,
      discountType: input.discountType,
      accessScope: input.accessScope,
      courseName: input.courseName,
      platformName: input.platformName,
      accessDurationMonths: input.accessDurationMonths,
      accessDurationDays: input.accessDurationDays,
      percentOff: input.percentOff,
      amountOff: input.amountOff,
      currency: input.currency ?? (input.amountOff ? 'usd' : undefined),
      maxRedemptions: input.maxRedemptions ?? null,
      redemptionCount: 0,
      oneUsePerUser: input.oneUsePerUser ?? true,
      requiresStripe: input.requiresStripe ?? false,
      stripeCouponId: input.stripeCouponId,
      stripePromotionCodeId: input.stripePromotionCodeId,
      startsAt: input.startsAt ? Timestamp.fromDate(input.startsAt) : undefined,
      expiresAt: input.expiresAt ? Timestamp.fromDate(input.expiresAt) : undefined,
      isActive: input.isActive ?? true,
      createdBy: input.adminUid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Drop undefined keys so Firestore doesn't store nulls everywhere.
    const cleaned = Object.fromEntries(
      Object.entries(docData).filter(([, v]) => v !== undefined),
    ) as Omit<DiscountCode, 'id'>;

    const ref = await addDoc(collection(db, 'discountCodes'), cleaned);
    return {
      success: true,
      data: { id: ref.id, ...cleaned } as DiscountCode,
    };
  } catch (err) {
    console.error('[discount-codes] createDiscountCode error:', err);
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * Activate or deactivate a code. Deactivating does NOT revoke
 * outstanding access grants — those continue until their stored
 * `accessExpiresAt`. (To revoke a specific user's grant, clear their
 * `activeAccessGrant` field directly; the redemption record remains
 * for audit.)
 */
export async function setDiscountCodeActive(input: {
  adminUid: string;
  discountCodeId: string;
  isActive: boolean;
}): Promise<ActionResult> {
  try {
    await requireAdmin(input.adminUid);
    await updateDoc(doc(db, 'discountCodes', input.discountCodeId), {
      isActive: input.isActive,
      updatedAt: serverTimestamp(),
    });
    return { success: true, data: undefined };
  } catch (err) {
    console.error('[discount-codes] setDiscountCodeActive error:', err);
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * List redemptions for a single code. Admin-only.
 */
export async function listRedemptionsForCode(input: {
  adminUid: string;
  discountCodeId: string;
}): Promise<ActionResult<DiscountCodeRedemption[]>> {
  try {
    if (!(await isUserAdmin(input.adminUid))) {
      return { success: false, error: 'Unauthorized.' };
    }
    const snap = await getDocs(
      query(
        collection(db, 'discountCodeRedemptions'),
        where('discountCodeId', '==', input.discountCodeId),
        orderBy('redeemedAt', 'desc'),
      ),
    );
    const rows = snap.docs.map(
      (d) =>
        ({
          id: d.id,
          ...(d.data() as Omit<DiscountCodeRedemption, 'id'>),
        }) as DiscountCodeRedemption,
    );
    return { success: true, data: rows };
  } catch (err) {
    console.error('[discount-codes] listRedemptionsForCode error:', err);
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}
