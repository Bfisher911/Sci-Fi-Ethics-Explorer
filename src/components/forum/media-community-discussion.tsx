'use client';

/**
 * Media-page discussion surface.
 *
 * Renders a discussion board on the sci-fi media detail page WHEN
 * and only when the viewer is a member of a community that has added
 * this media to its list. If the viewer belongs to multiple such
 * communities, a community selector is shown so the user can choose
 * which discussion to participate in (each community has its own
 * isolated board).
 *
 * The underlying thread UI is CommunityForum, reused with `mediaId`
 * scoping. Authority to pin threads still follows the community
 * manager / instructor / super-admin rules defined in the forum
 * action layer.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Users } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { useAuth } from '@/hooks/use-auth';
import { useSubscription } from '@/hooks/use-subscription';
import { getCommunitiesWithMediaForUser } from '@/app/actions/community-media';
import { getCommunity } from '@/app/actions/communities';
import { CommunityForum } from './community-forum';

interface Props {
  mediaId: string;
  mediaTitle: string;
  /** ?community=... hint from the URL; pre-selects that community if
   *  it is in the viewer's list. */
  preferredCommunityId?: string;
}

export function MediaCommunityDiscussion({
  mediaId,
  mediaTitle,
  preferredCommunityId,
}: Props): JSX.Element | null {
  const { user } = useAuth();
  const { isSuperAdmin } = useSubscription();
  const [candidates, setCandidates] = useState<
    Array<{ communityId: string; communityName: string }> | null
  >(null);
  const [selected, setSelected] = useState<string | undefined>(
    preferredCommunityId
  );
  const [viewerIsManager, setViewerIsManager] = useState(false);
  const [viewerIsMember, setViewerIsMember] = useState(false);
  const [viewerIsInstructor, setViewerIsInstructor] = useState(false);

  // Load the list of communities this user is in that have added
  // this media.
  useEffect(() => {
    if (!user) {
      setCandidates([]);
      return;
    }
    (async () => {
      const res = await getCommunitiesWithMediaForUser({
        mediaId,
        userId: user.uid,
      });
      setCandidates(res.success ? res.data : []);
      if (res.success && res.data.length > 0 && !selected) {
        setSelected(res.data[0].communityId);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mediaId, user]);

  // Resolve the current viewer's authority inside the selected community.
  useEffect(() => {
    if (!user || !selected) {
      setViewerIsManager(false);
      setViewerIsMember(false);
      setViewerIsInstructor(false);
      return;
    }
    (async () => {
      // Super-admin shortcut.
      if (isSuperAdmin) {
        setViewerIsManager(true);
      } else {
        const { isCommunityManager } = await import(
          '@/app/actions/community-manager'
        );
        setViewerIsManager(await isCommunityManager(user.uid));
      }
      const res = await getCommunity(selected);
      if (res.success && res.data) {
        setViewerIsInstructor(
          (res.data.instructorIds || []).includes(user.uid)
        );
        setViewerIsMember(
          (res.data.memberIds || []).includes(user.uid) ||
            (res.data.instructorIds || []).includes(user.uid)
        );
      }
    })();
  }, [user, selected, isSuperAdmin]);

  // No user, or still loading list: render nothing. This surface is
  // deliberately silent when there's nothing useful to show.
  if (!user || candidates === null) return null;
  if (candidates.length === 0) {
    // Still explain that discussion happens inside communities, so
    // power users know where this feature lives.
    return (
      <Card className="bg-card/60 backdrop-blur-sm border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageSquare className="h-4 w-4 text-primary" />
            Discussion
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            A discussion board for <span className="italic">{mediaTitle}</span>{' '}
            becomes available when it has been added to a community you belong
            to — a book club, a watch-along, a play-through.
          </p>
          <p>
            <Link
              href="/communities"
              className="text-primary hover:text-accent font-semibold inline-flex items-center gap-1"
            >
              <Users className="h-3.5 w-3.5" />
              Browse communities
            </Link>
          </p>
        </CardContent>
      </Card>
    );
  }

  const selectedEntry = candidates.find((c) => c.communityId === selected);

  return (
    <div className="space-y-3">
      {candidates.length > 1 && (
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">
            Discussing in:
          </span>
          <Select
            value={selected}
            onValueChange={(v) => setSelected(v)}
          >
            <SelectTrigger className="w-auto min-w-[220px]">
              <SelectValue placeholder="Select a community" />
            </SelectTrigger>
            <SelectContent>
              {candidates.map((c) => (
                <SelectItem key={c.communityId} value={c.communityId}>
                  {c.communityName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {selectedEntry && (
        <div className="text-[11px] text-muted-foreground">
          Private to members of{' '}
          <Link
            href={`/communities/${selectedEntry.communityId}`}
            className="font-semibold text-primary hover:text-accent"
          >
            {selectedEntry.communityName}
          </Link>
          .
        </div>
      )}

      {selected && (
        <CommunityForum
          communityId={selected}
          mediaId={mediaId}
          composeLabel="Start a discussion"
          viewerIsManager={viewerIsManager || viewerIsInstructor}
          viewerIsMember={viewerIsMember || viewerIsInstructor}
        />
      )}
    </div>
  );
}
