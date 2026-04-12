'use client';

import type { LeaderboardEntry } from '@/app/actions/badges';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Trophy, Medal, Award } from 'lucide-react';

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
}

/**
 * Displays a ranked leaderboard table with avatar, name, score, and badge count.
 */
export function LeaderboardTable({ entries }: LeaderboardTableProps) {
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
        {entries.map((entry) => (
          <TableRow key={entry.userId} className="hover:bg-muted/50">
            <TableCell className="text-center">
              <div className="flex items-center justify-center">
                {getRankIcon(entry.rank)}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  {entry.avatarUrl && (
                    <AvatarImage src={entry.avatarUrl} alt={entry.displayName} />
                  )}
                  <AvatarFallback className="text-xs">
                    {entry.displayName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">{entry.displayName}</span>
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
        ))}
      </TableBody>
    </Table>
  );
}
