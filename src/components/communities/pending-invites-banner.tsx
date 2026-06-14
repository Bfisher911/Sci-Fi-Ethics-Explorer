
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useSubscription } from '@/hooks/use-subscription';
import {
  getPendingInvites,
  acceptCommunityInvite,
  declineCommunityInvite,
} from '@/app/actions/communities';
import {
  getPendingOrgInvites,
  acceptInvite as acceptOrgInvite,
  declineOrgInvite,
} from '@/app/actions/organizations';
import type { CommunityInvite, OrganizationInvite } from '@/types';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Mail } from 'lucide-react';

type AnyInvite =
  | { kind: 'community'; id: string; name: string; invitedByName?: string; invite: CommunityInvite }
  | { kind: 'organization'; id: string; name: string; invitedByName?: string; invite: OrganizationInvite };

/**
 * Banner shown when the current user has pending invites — community OR
 * organization. Allows inline accept/decline. Community accept is gated on a
 * paid plan; org invites (seat-licensed) and all declines are always allowed.
 */
export function PendingInvitesBanner() {
  const { user } = useAuth();
  const { isPaid } = useSubscription();
  const [invites, setInvites] = useState<AnyInvite[]>([]);
  const [accepting, setAccepting] = useState<string | null>(null);
  const [declining, setDeclining] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.email) return;

    let cancelled = false;

    async function load() {
      const email = user!.email!;
      const [communityRes, orgRes] = await Promise.all([
        getPendingInvites(email),
        getPendingOrgInvites(email),
      ]);
      if (cancelled) return;

      const merged: AnyInvite[] = [];
      if (communityRes.success) {
        for (const c of communityRes.data) {
          merged.push({
            kind: 'community',
            id: c.id,
            name: c.communityName || 'a community',
            invitedByName: c.invitedByName,
            invite: c,
          });
        }
      }
      if (orgRes.success) {
        for (const o of orgRes.data) {
          merged.push({
            kind: 'organization',
            id: o.id,
            name: o.organizationName || 'an organization',
            invite: o,
          });
        }
      }
      setInvites(merged);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (invites.length === 0) return null;

  const remove = (id: string) =>
    setInvites((prev) => prev.filter((i) => i.id !== id));

  const handleAccept = async (item: AnyInvite) => {
    if (!user) return;
    setAccepting(item.id);
    const result =
      item.kind === 'community'
        ? await acceptCommunityInvite(item.id, user.uid)
        : await acceptOrgInvite(item.invite.organizationId, item.id, user.uid);
    if (result.success) remove(item.id);
    setAccepting(null);
  };

  const handleDecline = async (item: AnyInvite) => {
    if (!user) return;
    setDeclining(item.id);
    const result =
      item.kind === 'community'
        ? await declineCommunityInvite(item.id, user.uid)
        : await declineOrgInvite(item.invite.organizationId, item.id, user.uid);
    if (result.success) remove(item.id);
    setDeclining(null);
  };

  return (
    <Alert className="mb-4 bg-card/80 backdrop-blur-sm border-primary/30">
      <Mail className="h-4 w-4" />
      <AlertTitle>
        You have {invites.length} pending invite
        {invites.length > 1 ? 's' : ''}
      </AlertTitle>
      <AlertDescription>
        <ul className="mt-2 space-y-2">
          {invites.map((item) => {
            const busy = accepting === item.id || declining === item.id;
            // Community membership requires a paid plan; org seats don't.
            const acceptBlocked = item.kind === 'community' && !isPaid;
            return (
              <li key={`${item.kind}-${item.id}`} className="flex items-center gap-3">
                <span className="text-sm">
                  <span className="font-medium">{item.name}</span>{' '}
                  <span className="text-muted-foreground">
                    ({item.kind === 'organization' ? 'organization' : 'community'}
                    {item.invitedByName ? ` · invited by ${item.invitedByName}` : ''})
                  </span>
                </span>
                <div className="flex items-center gap-2">
                  {acceptBlocked ? (
                    <span className="text-xs text-muted-foreground italic">
                      Complete your plan setup to access this community
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busy}
                      onClick={() => handleAccept(item)}
                    >
                      {accepting === item.id ? 'Accepting...' : 'Accept'}
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-muted-foreground"
                    disabled={busy}
                    onClick={() => handleDecline(item)}
                  >
                    {declining === item.id ? 'Declining...' : 'Decline'}
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      </AlertDescription>
    </Alert>
  );
}
