'use client';

import { useState } from 'react';
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
import { Pencil, Trash2, Loader2, ShieldAlert } from 'lucide-react';

interface AdminActionsProps {
  /** Human-readable label for the artifact ("Story", "Dilemma", etc.). */
  artifactLabel: string;
  /** The artifact's title, shown in the delete-confirmation dialog. */
  artifactTitle: string;
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
 * Admin-only edit + delete controls for any content detail page.
 * Only renders when the current user is a super-admin.
 */
export function AdminActions({
  artifactLabel,
  artifactTitle,
  onDelete,
  afterDeleteHref = '/',
  editHref,
  onEdit,
}: AdminActionsProps): JSX.Element | null {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  if (adminLoading || !isAdmin || !user) return null;

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
      <span className="text-xs text-destructive font-medium mr-auto">Admin</span>

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
