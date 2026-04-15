'use client';

import type { LeaderboardEntry } from '@/app/actions/badges';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Trophy, Medal, Award, UserCircle, EyeOff } from 'lucide-react';

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  /** The current viewer's uid, if any. Used to apply the self-view exception. */
  currentUserId?: string | null;
}

/**
 * Applies the anonymity rules for a single leaderboard entry.
 *
 * Returns the name and avatar that should actually be rendered, given the
 * viewer's identity.
 *
 * Rules:
 *  - A user who has opted into anonymity is rendered as "Anonymous Explorer #XXXX"
 *    with a generic sci-fi avatar to everyone EXCEPT themselves.
 *  - The current viewer always sees their own real name, with a "Private" badge
 *    so they know their public appearance is anonymized.
 */
function resolveDisplay(
  entry: LeaderboardEntry,
  currentUserId?: string | null
): { name: string; avatarUrl?: string; isAnonymous: boolean; isSelf: boolean } {
  const isSelf = !!currentUserId && currentUserId === entry.userId;
  const wantsAnonymous = entry.anonymousOnLeaderboard === true;

  if (wantsAnonymous && !isSelf) {
    const shortHash = entry.userId.slice(-4).toUpperCase() || 'XXXX';
    return {
      name: `Anonymous Explorer #${shortHash}`,
      avatarUrl: undefined,
      isAnonymous: true,
      isSelf: false,
    };
  }

  return {
    name: entry.displayName,
    avatarUrl: entry.avatarUrl,
    isAnonymous: wantsAnonymous,
    isSelf,
  };
}

/**
 * Displays a ranked leaderboard table with avatar, name, score, and badge count.
 */
export function LeaderboardTable({ entries, currentUserId }: LeaderboardTableProps) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-400" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-300" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-sm text-muted-foreground font-medium">{rank}</span>;
    }
  };

  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Trophy className="h-12 w-12 mx-auto mb-4 opacity-40" />
        <p>No leaderboard data yet. Start exploring to earn your rank!</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-16 text-center">Rank</TableHead>
          <TableHead>Explorer</TableHead>
          <TableHead className="text-right">Score</TableHead>
          <TableHead className="text-right">Badges</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.map((entry) => {
          const { name, avatarUrl, isAnonymous, isSelf } = resolveDisplay(
            entry,
            currentUserId
          );
          const rowHighlight = isSelf ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-muted/50';
          return (
            <TableRow key={entry.userId} className={rowHighlight}>
              <TableCell className="text-center">
                <div className="flex items-center justify-center">
                  {getRankIcon(entry.rank)}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  {isAnonymous && !isSelf ? (
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground"
                      aria-label="Anonymous explorer"
                    >
                      <UserCircle className="h-5 w-5" />
                    </div>
                  ) : (
                    <Avatar className="h-8 w-8">
                      {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
                      <AvatarFallback className="text-xs">
                        {name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{name}</span>
                    {isSelf && (
                      <Badge variant="outline" className="text-xs">
                        You
                      </Badge>
                    )}
                    {isSelf && isAnonymous && (
                      <Badge variant="secondary" className="text-xs gap-1">
                        <EyeOff className="h-3 w-3" />
                        Private
                      </Badge>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-right font-semibold text-primary">
                {entry.score.toLocaleString()}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Award className="h-4 w-4 text-accent" />
                  <span>{entry.badgeCount}</span>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
