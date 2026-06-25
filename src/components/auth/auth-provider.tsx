
'use client';

import type { User } from 'firebase/auth';
// 🔁 PATCH: Import getIdTokenResult and useCallback (BF 2025-06-06)
import { onAuthStateChanged, getIdTokenResult } from 'firebase/auth';
import { createContext, useEffect, useState, type ReactNode, useCallback } from 'react';
// 🔁 END PATCH
import { auth } from '@/lib/firebase/config';
// 🔁 PATCH: Import AuthContextType from use-auth.ts (BF 2025-06-06)
import type { AuthContextType } from '@/hooks/use-auth';
// 🔁 END PATCH

// AuthContextType is now defined in and imported from '@/hooks/use-auth'
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * ─── DEV-ONLY AUTH BYPASS ────────────────────────────────────────────
 * When BOTH `NODE_ENV === 'development'` AND
 * `NEXT_PUBLIC_DEV_AUTH_BYPASS === 'true'`, the provider skips the real
 * Firebase auth listener and injects a mock signed-in user so the
 * protected app shell renders locally without a live login — purely for
 * design / QA review.
 *
 * SAFETY — double-gated. In any production build `NODE_ENV` is
 * 'production', so this whole branch is dead-code-eliminated and the
 * mock can NEVER activate, regardless of the env flag. The bypass is
 * client-only and grants NO real Firebase credentials: rule-protected
 * Firestore/Storage reads still fail, so it's for rendering, not data.
 * Enable via `.env.local` (gitignored); never set the flag in a deploy.
 * ──────────────────────────────────────────────────────────────────── */
const DEV_AUTH_BYPASS =
  process.env.NODE_ENV === 'development' &&
  process.env.NEXT_PUBLIC_DEV_AUTH_BYPASS === 'true';

// Mock user wears the canonical super-admin email so useAdmin /
// useSubscription short-circuit to admin + paid WITHOUT any Firestore
// read (see src/lib/super-admins.ts). The uid is obviously fake.
const DEV_MOCK_USER = {
  uid: 'dev-bypass-uid',
  email: 'bfisher3@tulane.edu',
  displayName: 'Dev Bypass — Professor Paradox',
  photoURL: null,
  emailVerified: true,
  isAnonymous: false,
  phoneNumber: null,
  providerId: 'password',
  tenantId: null,
  refreshToken: '',
  metadata: {},
  providerData: [],
  getIdToken: async () => 'dev-bypass-token',
  getIdTokenResult: async () => ({ claims: { admin: true } }),
  reload: async () => {},
  delete: async () => {},
  toJSON: () => ({}),
} as unknown as User;

const DEV_MOCK_CLAIMS: AuthContextType['claims'] = { admin: true, role: 'owner' };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(
    DEV_AUTH_BYPASS ? DEV_MOCK_USER : null,
  );
  const [loading, setLoading] = useState(!DEV_AUTH_BYPASS);
  // 🔁 PATCH: Add state for claims (BF 2025-06-06)
  const [claims, setClaims] = useState<AuthContextType['claims'] | null>(
    DEV_AUTH_BYPASS ? DEV_MOCK_CLAIMS : null,
  );
  // 🔁 END PATCH

  // 🔁 PATCH: Implement refreshClaims function (BF 2025-06-06)
  const refreshClaims = useCallback(async (currentUserParam?: User | null) => {
    const targetUser = currentUserParam !== undefined ? currentUserParam : user; // Use passed user or current state user
    
    if (targetUser) {
      console.log("Auth Provider: Attempting to refresh claims for user:", targetUser.uid);
      try {
        // Force refresh the token to get latest claims by passing `true`
        const idTokenResult = await getIdTokenResult(targetUser, true);
        // Store all claims. The AuthContextType['claims'] should match this structure.
        setClaims(idTokenResult.claims as AuthContextType['claims']);
        console.log("Auth Provider: Claims refreshed successfully for user:", targetUser.uid, idTokenResult.claims);
      } catch (error) {
        console.error("Auth Provider: Error refreshing claims for user:", targetUser.uid, error);
        setClaims(null); // Clear claims on error to avoid stale/incorrect claims
      }
    } else {
      console.log("Auth Provider: No target user to refresh claims for, clearing claims.");
      setClaims(null); // No user, so no claims
    }
  }, [user]); // Make refreshClaims dependent on the `user` state, so it gets the latest user if not passed one
  // 🔁 END PATCH

  useEffect(() => {
    // Dev bypass: skip the real Firebase listener and the sign-in side
    // effects (profile creation, seat claiming, super-admin license). The
    // mock user is already seeded into state above.
    if (DEV_AUTH_BYPASS) {
      console.warn(
        '[AuthProvider] DEV_AUTH_BYPASS active — mock user injected, Firebase auth listener skipped. NEVER enable in production.',
      );
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log("Auth Provider: Auth state changed. Current user:", currentUser?.uid || 'None');
      
      try {
        setUser(currentUser);
        if (currentUser) {
          // Promise.race to prevent indefinite hang on claims fetch
          const claimsTimeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Claims fetch timeout")), 5000)
          );
          
          console.log("Auth Provider: Fetching claims...");
          await Promise.race([refreshClaims(currentUser), claimsTimeout])
            .catch(err => console.warn("Auth Provider: Claims fetch failed or timed out, continuing without fresh claims:", err));

          // Idempotently ensure the users/{uid} doc exists BEFORE we
          // try to claim a seat onto it. createUserProfile is a no-op
          // for the immutable identity fields when the doc is already
          // there (it carefully avoids clobbering subscription /
          // license / onboarding state). The signup form also calls
          // this — running it twice in a row is fine and prevents the
          // race where claimPendingSeats writes a doc, then the signup
          // form's createUserProfile races in afterwards and overwrites
          // those fields.
          try {
            const { createUserProfile } = await import('@/app/actions/user');
            await createUserProfile(
              currentUser.uid,
              currentUser.email,
              currentUser.displayName,
            );
          } catch (err) {
            console.warn('Auth Provider: createUserProfile (ensure) failed:', err);
          }

          // If an instructor pre-assigned a seat to this user's email
          // BEFORE they had an account, link the seat to their new uid
          // and activate their subscription. No-ops when nothing matches.
          try {
            const { claimPendingSeats } = await import('@/app/actions/licenses');
            const claimRes = await claimPendingSeats(
              currentUser.uid,
              currentUser.email
            );
            if (claimRes.success && claimRes.data.claimed > 0) {
              console.log(
                'Auth Provider: claimed',
                claimRes.data.claimed,
                'pending seat(s) for',
                currentUser.email
              );
            }
          } catch (err) {
            console.warn('Auth Provider: claimPendingSeats failed:', err);
          }

          // If this is the canonical super-admin signing in, make sure
          // their unmetered owner license exists. Idempotent.
          try {
            const { isSuperAdminEmail } = await import('@/lib/super-admins');
            if (isSuperAdminEmail(currentUser.email)) {
              const { ensureSuperAdminLicense } = await import(
                '@/app/actions/licenses'
              );
              await ensureSuperAdminLicense(currentUser.uid);
            }
          } catch (err) {
            console.warn(
              'Auth Provider: ensureSuperAdminLicense failed:',
              err,
            );
          }
        } else {
          setClaims(null);
        }
      } catch (error) {
        console.error("Auth Provider: Error in onAuthStateChanged handler:", error);
      } finally {
        console.log("Auth Provider: Setting loading to false.");
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [refreshClaims]);

  // Always render children. `loading` is exposed through context so
  // components that actually need to wait for auth (like the protected
  // app shell) can show their own loading state. Public pages like the
  // home splash, /about, and the auth pages render immediately.
  return (
    <AuthContext.Provider value={{ user, loading, claims, refreshClaims }}>
      {children}
    </AuthContext.Provider>
  );
}
