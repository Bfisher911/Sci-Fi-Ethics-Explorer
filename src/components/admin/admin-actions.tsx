'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAdmin } from '@/hooks/use-admin';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { canActorMutate } from '@/app/actions/permissions';
import { Pencil, Trash2, Loader2, ShieldAlert } from 'lucide-react';

interface AdminActionsProps {
  /** Human-readable label for the artifact ("Story", "Dilemma", etc.). */
  artifactLabel: string;
  /** The artifact's title, shown in the delete-confirmation dialog. */
  artifactTitle: string;
  /**
   * Author UID of the artifact being shown. When provided, the
   * Edit/Delete controls render only if the current actor can mutate
   * artifacts authored by this UID under the tiered scope rules
   * (super-admin: any; license-admin: own + license-group authors;
   * member: only own). When omitted, the legacy behavior of
   * "show-if-isAdmin" is used (compatible with existing call sites
   * that haven't been updated yet).
   */
  artifactAuthorUid?: string | null;
  /** Called when the admin confirms deletion. Return a promise that resolves
   *  to `{ success: boolean; error?: string }`. */
  onDelete: (adminUid: string) => Promise<{ success: boolean; error?: string }>;
  /** Where to navigate after a successful deletion. */
  afterDeleteHref?: string;
  /** Optional edit URL. When provided, an "Edit" button is rendered. */
  editHref?: string;
  /** Optional: called instead of navigating to editHref (for inline edit). */
  onEdit?: () => void;
}

/**
 * Edit + delete controls for any content detail page.
 *
 * Renders only when the current actor is allowed to mutate the
 * specific artifact (per the tiered scope rules in
 * src/lib/permissions/scope.ts). When `artifactAuthorUid` is omitted
 * the legacy `isAdmin === true` gate is used so older call sites
 * continue to work unchanged.
 */
export function AdminActions({
  artifactLabel,
  artifactTitle,
  artifactAuthorUid,
  onDelete,
  afterDeleteHref = '/',
  editHref,
  onEdit,
}: AdminActionsProps): JSX.Element | null {
  const { isAdmin, isSuperAdmin, loading: adminLoading } = useAdmin();
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  // Scope-aware permission probe. Super-admin and the legacy isAdmin
  // path skip the probe entirely; everyone else has to ask the server.
  const [scopeAllowed, setScopeAllowed] = useState<boolean | null>(null);
  useEffect(() => {
    if (adminLoading || !user) return;
    if (artifactAuthorUid === undefined) {
      // Legacy mode: gate on isAdmin only.
      setScopeAllowed(isAdmin);
      return;
    }
    // Super-admin shortcut — always yes, no round trip needed.
    if (isSuperAdmin) {
      setScopeAllowed(true);
      return;
    }
    let cancelled = false;
    canActorMutate(user.uid, artifactAuthorUid).then((res) => {
      if (cancelled) return;
      setScopeAllowed(res.success ? res.data : false);
    });
    return () => {
      cancelled = true;
    };
  }, [
    adminLoading,
    user,
    isAdmin,
    isSuperAdmin,
    artifactAuthorUid,
  ]);

  if (adminLoading || !user) return null;
  if (scopeAllowed === null) return null; // probe still running
  if (!scopeAllowed) return null;

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const result = await onDelete(user.uid);
      if (result.success) {
        toast({
          title: `${artifactLabel} deleted`,
          description: `"${artifactTitle}" has been removed.`,
        });
        router.push(afterDeleteHref);
      } else {
        toast({
          title: 'Delete failed',
          description: result.error || 'Unknown error.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Delete failed',
        description: err instanceof Error ? err.message : String(err),
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-2 p-3 rounded-lg border border-destructive/30 bg-destructive/5">
      <ShieldAlert className="h-4 w-4 text-destructive shrink-0" />
      <span className="text-xs text-destructive font-medium mr-auto">
        {isSuperAdmin ? 'Super-Admin' : 'Admin'}
      </span>

      {(editHref || onEdit) && (
        <Button
          variant="outline"
          size="sm"
          onClick={onEdit || (() => router.push(editHref!))}
        >
          <Pencil className="h-3.5 w-3.5 mr-1.5" />
          Edit
        </Button>
      )}

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" size="sm" disabled={deleting}>
            {deleting ? (
              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
            )}
            Delete
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete this {artifactLabel.toLowerCase()}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove <strong>"{artifactTitle}"</strong>.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleting ? 'Deleting…' : 'Yes, delete it'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
