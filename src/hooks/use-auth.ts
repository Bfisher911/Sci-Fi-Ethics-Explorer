
import type { User } from 'firebase/auth'; // Ensure User type is imported
import { useContext } from 'react';
// 🔁 PATCH: Update AuthContext import path if AuthContextType is now defined here (BF 2025-06-06)
// Assuming AuthContext itself is still exported from auth-provider.tsx
import { AuthContext } from '@/components/auth/auth-provider';
// 🔁 END PATCH

// 🔁 PATCH: Add custom claims to AuthContextType (BF 2025-06-06)
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  claims?: {
    teamId?: string; // Standardized to teamId as per architectural plan
    role?: string;   // Role within the teamId (owner, leader, member)
    // We can add other app-specific global roles here if needed, e.g. platformAdmin: true
    [key: string]: any; // For other potential claims
  } | null;
  refreshClaims: (currentUser?: User | null) => Promise<void>; // Function to force refresh claims
}
// 🔁 END PATCH


export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  // 🔁 PATCH: Cast to new type (BF 2025-06-06)
  return context as AuthContextType;
  // 🔁 END PATCH
};
