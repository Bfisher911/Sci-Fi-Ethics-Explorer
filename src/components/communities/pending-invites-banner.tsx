
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useSubscription } from '@/hooks/use-subscription';
import { getPendingInvites, acceptCommunityInvite } from '@/app/actions/communities';
import type { CommunityInvite } from '@/types';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Mail } from 'lucide-react';

/**
 * Banner shown when the current user has pending community invites.
 * Allows inline acceptance. If the user is unpaid, a note is shown instead.
 */
export function PendingInvitesBanner() {
  const { user } = useAuth();
  const { isPaid } = useSubscription();
  const [invites, setInvites] = useState<CommunityInvite[]>([]);
  const [accepting, setAccepting] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.email) return;

    let cancelled = false;

    async function load() {
      const result = await getPendingInvites(user!.email!);
      if (!cancelled && result.success) {
        setInvites(result.data);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (invites.length === 0) return null;

  const handleAccept = async (inviteId: string) => {
    if (!user) return;
    setAccepting(inviteId);
    const result = await acceptCommunityInvite(inviteId, user.uid);
    if (result.success) {
      setInvites((prev) => prev.filter((i) => i.id !== inviteId));
    }
    setAccepting(null);
  };

  return (
    <Alert className="mb-4 bg-card/80 backdrop-blur-sm border-primary/30">
      <Mail className="h-4 w-4" />
      <AlertTitle>
        You have {invites.length} pending community invite
        {invites.length > 1 ? 's' : ''}
      </AlertTitle>
      <AlertDescription>
        <ul className="mt-2 space-y-2">
          {invites.map((invite) => (
            <li key={invite.id} className="flex items-center gap-3">
              <span className="text-sm">
                <span className="font-medium">{invite.communityName}</span>
                {' '}
                <span className="text-muted-foreground">
                  (invited by {invite.invitedByName || 'unknown'})
                </span>
              </span>
              {isPaid ? (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={accepting === invite.id}
                  onClick={() => handleAccept(invite.id)}
                >
                  {accepting === invite.id ? 'Accepting...' : 'Accept'}
                </Button>
              ) : (
                <span className="text-xs text-muted-foreground italic">
                  Complete your plan setup to access this community
                </span>
              )}
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}
