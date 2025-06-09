
'use client';

import type { User } from 'firebase/auth';
// 🔁 PATCH: Import getIdTokenResult and useCallback (BF 2025-06-06)
import { onAuthStateChanged, getIdTokenResult } from 'firebase/auth';
import { createContext, useEffect, useState, type ReactNode, useCallback } from 'react';
// 🔁 END PATCH
import { auth } from '@/lib/firebase/config';
import { Skeleton } from '@/components/ui/skeleton';
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
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => { // Make async
      console.log("Auth Provider: Auth state changed. Current user:", currentUser?.uid || 'None');
      setUser(currentUser);
      if (currentUser) {
        // When auth state changes to a new user, fetch their claims.
        await refreshClaims(currentUser);
      } else {
        // User logged out, clear claims.
        setClaims(null);
      }
      setLoading(false);
    });
    return () => unsubscribe(); // Cleanup subscription
  }, [refreshClaims]); // Add refreshClaims to dependency array

  if (loading) {
    // Simple full-page skeleton loader
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <div className="w-full max-w-md space-y-6">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-10 w-1/2" />
        </div>
      </div>
    );
  }

  return (
    // 🔁 PATCH: Pass claims and refreshClaims in context value (BF 2025-06-06)
    <AuthContext.Provider value={{ user, loading, claims, refreshClaims }}>
      {children}
    </AuthContext.Provider>
    // 🔁 END PATCH
  );
}
