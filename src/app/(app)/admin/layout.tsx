'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/hooks/use-admin';
import { useAuth } from '@/hooks/use-auth';
import { hasOwnedLicenses } from '@/app/actions/scope';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

/**
 * Admin layout that gates access to admin sub-pages.
 *
 * Three tiers may enter:
 *   - Super-admin (email allowlist) — sees everything
 *   - `isAdmin === true` flag holders — legacy admin users
 *   - License admins — anyone who purchased a seat license; their
 *     scope is filtered to their license group inside each page
 *
 * Anyone else is redirected to /stories.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  const { isAdmin, isSuperAdmin, loading: adminLoading } = useAdmin();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [licenseAdmin, setLicenseAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLicenseAdmin(false);
      return;
    }
    let cancelled = false;
    hasOwnedLicenses(user.uid).then((res) => {
      if (cancelled) return;
      setLicenseAdmin(res.success ? res.data : false);
    });
    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  const loading =
    adminLoading || authLoading || (user !== null && licenseAdmin === null);

  if (loading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  const allowed = isAdmin || isSuperAdmin || licenseAdmin === true;

  if (!allowed) {
    router.push('/stories');
    return (
      <div className="container mx-auto py-16 px-4 max-w-lg">
        <Alert variant="destructive">
          <ShieldCheck className="h-4 w-4" />
          <AlertTitle>Unauthorized</AlertTitle>
          <AlertDescription>
            You do not have admin privileges. Redirecting...
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6 flex items-center gap-2 text-primary">
        <ShieldCheck className="h-5 w-5" />
        <span className="text-sm font-medium uppercase tracking-wider">
          {isSuperAdmin ? 'Super-Admin Panel' : 'Admin Panel'}
        </span>
      </div>
      {children}
    </div>
  );
}
