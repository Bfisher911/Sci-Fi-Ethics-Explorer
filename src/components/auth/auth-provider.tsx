
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  // 🔁 PATCH: Add state for claims (BF 2025-06-06)
  const [claims, setClaims] = useState<AuthContextType['claims'] | null>(null);
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
