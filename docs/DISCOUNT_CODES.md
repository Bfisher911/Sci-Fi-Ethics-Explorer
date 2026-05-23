# Discount Codes

The generic discount-code system lets the platform grant access to a user
without taking a payment, while keeping the regular Stripe billing path
untouched. This document explains how it works, why it was built this
way, how to verify students will not be charged, and how to add new
codes.

The user-facing label is always **"Discount Code"** — never "Class
Access Code" or "Student Access Code" — so the same field can serve
class access, pilot programs, beta testers, institutional trials,
promotional discounts, comped accounts, and any future use case.

## Quick start: the four-month class code

Three starter codes are configured for **The Ethics of Technology
through Science Fiction** on **Off World Clause**:

- `OFFWORLD-CLASS-2026`
- `OFFWORLD-ETHICS-2026`
- `OFFWORLD-STUDENT-ACCESS`

Each grants **4 months of free access** to Off World Clause for the
course, starting at the moment of redemption. No credit card. No
charge after expiration.

To seed them into your environment:

```bash
npx tsx src/scripts/seed-discount-codes.ts
```

The script is idempotent — re-running it skips codes that already
exist. Edit `STARTER_CODES` in that file to add more.

## The student flow

1. The student visits `/signup` and creates an account. An optional
   **Discount Code** field appears in the signup form.
2. If the student enters a code at signup, it is redeemed immediately
   after the account is created. They land on the dashboard with
   access already active.
3. If the student leaves the field blank, they land on `/onboarding`,
   which also shows a **Discount Code** panel above the paid plans.
4. Existing users can redeem from `/billing` at any time.

At no point are students with a free-access code asked for a credit
card or sent to Stripe Checkout. The platform does not create a Stripe
customer or subscription for them.

## Why app-level grants, not Stripe promotion codes?

This is the most important design decision in the file. The
requirement: *students must never be charged after the free access
period ends*. There are two ways to give someone "100% off for four
months" with Stripe:

1. **Stripe coupon attached to a subscription.** A 4-month, 100%-off
   coupon is applied at Checkout. After month four the coupon
   expires and the subscription tries to bill the saved payment
   method. Cancelling in advance via `cancel_at` works only if the
   subscription is created at all — which requires a payment method
   in most Stripe configurations, defeating the "no card required"
   requirement. Even with the `cancel_at` safety net, this is brittle:
   any later webhook race that reactivates the subscription quietly
   re-enrolls the student into paid billing.
2. **App-level access grant.** A Firestore document grants access
   until a stored `accessExpiresAt`. The grant is read by
   `hasActiveAccess` alongside the existing subscription / license
   sources. There is no Stripe object to bill. When the grant
   expires, the user falls back to whatever paid access they have
   (probably none) and sees the regular paywall.

**We picked option 2** because it is unconditionally safe: there is no
Stripe object to ever bill, no payment method to capture, and no
webhook that could flip an expired grant back on. Stripe billing for
paying customers continues to work exactly as before — this system is
purely additive.

The regular paid Checkout flow already calls
`stripe.checkout.sessions.create({ ..., allow_promotion_codes: true })`,
so Stripe promotion codes for *paying* customers (e.g. "20% off
annual") still work through the standard Stripe UI without any code
change here. The discount-code system is for the *free* path only.

## Data model

### `discountCodes/{id}`

| Field                  | Type          | Notes                                                                |
| ---------------------- | ------------- | -------------------------------------------------------------------- |
| `code`                 | string        | Uppercased, unique, case-insensitive on lookup.                      |
| `name`                 | string        | Admin label.                                                         |
| `description`          | string?       | Admin-facing description.                                            |
| `discountType`         | enum          | `free_access` / `comped` / `pilot` / `beta` / `institution` / `promotional` / `percent_off` / `amount_off`. |
| `accessScope`          | enum          | `platform` / `course` / `platform_course`.                           |
| `courseName`           | string?       | E.g. "The Ethics of Technology through Science Fiction".             |
| `platformName`         | string?       | E.g. "Off World Clause".                                             |
| `accessDurationMonths` | number?       | Months of access from redemption date.                               |
| `accessDurationDays`   | number?       | Days of access (used by short pilots/beta).                          |
| `percentOff`           | number?       | Stripe-flow only.                                                    |
| `amountOff`            | number?       | Stripe-flow only, in cents.                                          |
| `currency`             | string?       | Default `usd` when `amountOff` is set.                               |
| `maxRedemptions`       | number / null | Global cap. `null` = unlimited.                                      |
| `redemptionCount`      | number        | Server-maintained; bumped atomically with each redemption.           |
| `oneUsePerUser`        | boolean       | Default true.                                                        |
| `requiresStripe`       | boolean       | Always false for free-access types.                                  |
| `stripeCouponId`       | string?       | Stripe-flow only.                                                    |
| `stripePromotionCodeId`| string?       | Stripe-flow only.                                                    |
| `startsAt`             | Timestamp?    | Code is invalid before this.                                         |
| `expiresAt`            | Timestamp?    | Code is invalid after this (independent of per-redemption window).   |
| `isActive`             | boolean       | Hard switch — when false, redemption fails regardless of dates.      |
| `createdBy`            | string?       | UID of admin who created the code.                                   |
| `createdAt`/`updatedAt`| Timestamp     | Server timestamps.                                                   |

### `discountCodeRedemptions/{id}`

| Field                  | Type          | Notes                                                       |
| ---------------------- | ------------- | ----------------------------------------------------------- |
| `discountCodeId`       | string        | FK to `discountCodes`.                                      |
| `code`                 | string        | Snapshot of the code text at redemption.                    |
| `userId`               | string        | Firebase UID.                                               |
| `userEmail`            | string?       | Snapshot.                                                   |
| `redeemedAt`           | Timestamp     | Server timestamp.                                           |
| `accessStartsAt`       | Timestamp     | Usually `= redeemedAt`.                                     |
| `accessExpiresAt`      | Timestamp     | Authoritative end of access for this redemption.            |
| `accessScope`          | enum          | Snapshot.                                                   |
| `accessType`           | enum          | Snapshot of `discountType`.                                 |
| `courseName`           | string?       | Snapshot.                                                   |
| `platformName`         | string?       | Snapshot.                                                   |
| `stripeCustomerId`     | string?       | Absent for free-access redemptions.                         |
| `stripeSubscriptionId` | string?       | Absent for free-access redemptions.                         |
| `metadata`             | map           | Free-form.                                                  |
| `createdAt`            | Timestamp     | Server timestamp.                                           |

### `users/{uid}.activeAccessGrant`

Snapshot of the redemption written onto the user doc for fast read-side
entitlement. Looks exactly like a `UserAccessGrant` (see
`src/types/index.ts`). Cleared lazily when access has expired
(see `getActiveAccessGrant`).

## How access checks work

The single function that decides "is this user active" is
`hasActiveAccess(subscriptionStatus, activeLicenseId, accessGrant)` in
`src/lib/permissions.ts`. Returns true if **any** of these are true:

1. The user has an active `activeLicenseId` (seat under an
   organization license).
2. The user's Stripe `subscriptionStatus` is `active` or `trial`.
3. The user's `activeAccessGrant.accessExpiresAt` is in the future.

The client hook `useSubscription` reads all three from
`users/{uid}` in a single live `onSnapshot`, so the existing UI
("Complete setup" banner, paywalls, gating) automatically respects
discount-code grants without per-page edits.

## When a code is redeemed (`redeemDiscountCode`)

1. Server action looks up the code text (uppercased) in
   `discountCodes`.
2. Pre-checks: active, not started, not expired, not over its
   redemption cap, not already used by this user.
3. Confirms the type is a free-access type (otherwise it returns an
   error directing the caller to the Stripe Checkout flow).
4. Inside a Firestore transaction:
   - re-validates with the freshest counter (race-safe);
   - creates a new `discountCodeRedemptions/{id}` record;
   - increments `redemptionCount` on the code.
5. Outside the transaction, writes a snapshot grant onto
   `users/{uid}.activeAccessGrant` so the live `useSubscription`
   listener picks it up immediately.
6. Returns the success message that includes the platform name, the
   optional course name, the exact expiration date, and the explicit
   "you will not be charged automatically" assurance.

**No Stripe API call is made anywhere in this flow.**

## Verifying students will not be charged

A short manual checklist anyone can run:

1. Open Stripe Dashboard → Customers. Search for the student's email.
   For a free-access redemption, **no customer record will exist**.
2. Open Stripe Dashboard → Subscriptions. Filter by the student's
   email. **No subscription will exist.**
3. In Firestore, open `users/{uid}`. Confirm that:
   - `stripeCustomerId` is absent (or empty);
   - `subscriptionId` is absent;
   - `subscriptionStatus` is `none` (or unset);
   - `activeAccessGrant` is populated with a future `accessExpiresAt`.
4. Hit `/billing` while signed in as the student. The "Manage payment
   & invoices" panel renders **only** when a `stripeCustomerId` is on
   file — for grant users it stays hidden.

Programmatic check:

```ts
import { getActiveAccessGrant } from '@/app/actions/discount-codes';
const res = await getActiveAccessGrant(uid);
// res.data.accessExpiresAt is the moment access lapses.
// At that point, getActiveAccessGrant lazily clears the snapshot
// and hasActiveAccess returns false. Stripe is not consulted.
```

## When a grant expires

There is no scheduled job. Expiration is handled lazily:

- Every read of `hasActiveAccess` consults `accessExpiresAt` against
  the current clock. After expiry, `isGrantActive` returns false and
  the user is treated as un-paid.
- The first time `getActiveAccessGrant` is called after expiry, the
  stale snapshot is cleared from the user doc.

If you want a cleanup pass (e.g. for analytics), add a Cloud Function
that nightly queries `users` for `activeAccessGrant.accessExpiresAt <
now` and clears the field. Not required for correctness.

## Adding new codes

### Via the admin UI

1. Visit `/admin/discount-codes` (admin only).
2. Click **New code** and fill in the form.
3. The form is biased toward free-access codes (the common case): it
   defaults to `free_access`, `platform_course` scope, the class name,
   "Off World Clause", and 4 months.

### Via a script

Edit `STARTER_CODES` in `src/scripts/seed-discount-codes.ts` and run
the script again. Re-runs are idempotent — codes that already exist
are skipped.

### Programmatically

```ts
import { createDiscountCode } from '@/app/actions/discount-codes';
await createDiscountCode({
  adminUid: '<your-uid>',
  code: 'PILOT-2026-Q3',
  name: 'Q3 2026 Pilot Cohort',
  discountType: 'pilot',
  accessScope: 'platform',
  platformName: 'Off World Clause',
  accessDurationMonths: 3,
  maxRedemptions: 25,
});
```

## Stripe inspection notes

Performed via the Stripe MCP during the initial implementation:

- Existing products: Monthly / Semester / Annual Individual Plans;
  Institution / Department / Department Pilot / Individual Professor
  license tiers; legacy "Voyager" and archived plans.
- The platform's checkout already passes
  `allow_promotion_codes: true`, so Stripe-side promo codes for paid
  customers continue to work through the standard hosted UI.
- Webhooks handled: `checkout.session.completed`,
  `customer.subscription.created/updated/deleted`,
  `invoice.payment_failed`. None of these are triggered by free-access
  discount-code redemptions, because no Stripe object is created.

For Stripe-flow discount codes (`percent_off` / `amount_off`), create
a coupon and promotion code in the Stripe Dashboard, store the IDs on
the `DiscountCode` record (`stripeCouponId`, `stripePromotionCodeId`),
and use the existing Checkout flow — the user enters the promotion
code in Stripe's hosted UI.

## Tests

`src/lib/discount-codes.test.ts` covers the pure logic:

- Successful redemption.
- Invalid / expired / not-yet-started / inactive / max-redemptions /
  already-redeemed cases.
- 4-month duration produces the right expiration date.
- An expired grant snapshot is reported as inactive.
- `hasActiveAccess` honors the grant alongside subscriptions and
  licenses.
- A free-access code never surfaces Stripe identifiers (regression
  fence against accidentally wiring billing into the free path).

Run with `npm test`.
