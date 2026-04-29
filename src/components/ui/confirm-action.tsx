'use client';

/**
 * <ConfirmAction> — a shadcn AlertDialog wrapper for the platform's
 * destructive-action confirmations. Replaces ad-hoc inline AlertDialog
 * setups (delete a story, revoke a seat, leave a community, etc.) with
 * one consistent visual + copy hierarchy.
 *
 * Usage:
 *
 *   <ConfirmAction
 *     trigger={<Button variant="destructive">Delete</Button>}
 *     title="Delete this story?"
 *     description="This permanently removes the story and all its
 *                  comments. You can't undo this."
 *     confirmLabel="Delete story"
 *     onConfirm={() => deleteStory(id)}
 *   />
 *
 * Defaults assume a destructive action. Pass `tone="primary"` for
 * non-destructive confirmations (e.g., publish, send, mark complete).
 */

import { type ReactNode, useState } from 'react';
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
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConfirmActionProps {
  /** The clickable element that opens the dialog. */
  trigger: ReactNode;
  title: string;
  description: ReactNode;
  /** Label on the confirm button. Default: "Confirm". */
  confirmLabel?: string;
  /** Label on the cancel button. Default: "Cancel". */
  cancelLabel?: string;
  /** Called when the user clicks confirm. May return a Promise; the
   *  dialog stays open and the confirm button shows a spinner while
   *  the promise resolves. The dialog closes on resolution; the
   *  component does NOT close automatically on rejection so the
   *  caller can show an error. */
  onConfirm: () => void | Promise<void>;
  /** Visual tone of the confirm button. Default: 'destructive'. */
  tone?: 'destructive' | 'primary';
  /** Optional controlled-open. Defaults to internal state. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ConfirmAction({
  trigger,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  tone = 'destructive',
  open: controlledOpen,
  onOpenChange,
}: ConfirmActionProps): JSX.Element {
  const [internalOpen, setInternalOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const open = controlledOpen ?? internalOpen;
  const setOpen = (v: boolean) => {
    if (controlledOpen === undefined) setInternalOpen(v);
    onOpenChange?.(v);
  };

  async function handleConfirm() {
    setPending(true);
    try {
      await onConfirm();
      setOpen(false);
    } catch {
      // leave dialog open so caller can surface an error toast / state
    } finally {
      setPending(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            disabled={pending}
            onClick={(e) => {
              e.preventDefault();
              void handleConfirm();
            }}
            className={cn(
              tone === 'destructive' &&
                'bg-destructive text-destructive-foreground hover:bg-destructive/90',
            )}
          >
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
