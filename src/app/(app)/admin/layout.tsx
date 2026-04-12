'use client';

import { type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/hooks/use-admin';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

/**
 * Admin layout that gates access to admin sub-pages.
 * Redirects non-admin users to /stories.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  const { isAdmin, loading } = useAdmin();
  const router = useRouter();

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

  if (!isAdmin) {
    // Redirect non-admins after a brief display
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
          Admin Panel
        </span>
      </div>
      {children}
    </div>
  );
}
