'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Users, Search, UserCircle } from 'lucide-react';

import {
  getDirectoryUsers,
  type DirectoryUser,
} from '@/app/actions/directory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

/** Supported framework names shown in the directory filter. */
const FRAMEWORK_OPTIONS: string[] = [
  'Utilitarianism',
  'Deontology (Kantian Ethics)',
  'Virtue Ethics',
  'Social Contract Theory',
  'Ethics of Care',
  'Existentialist Ethics',
  'Contractualism',
  'Capabilities Approach',
  'Ubuntu Ethics',
];

const ALL_VALUE = '__all__';

function UserCardSkeleton(): React.ReactElement {
  return (
    <Card className="bg-card/80 backdrop-blur-sm">
      <CardContent className="p-6 flex flex-col items-center gap-3 text-center">
        <Skeleton className="h-20 w-20 rounded-full" />
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-28 mt-2" />
      </CardContent>
    </Card>
  );
}

function UserMiniCard({ user }: { user: DirectoryUser }): React.ReactElement {
  const initial =
    user.displayName && user.displayName.length > 0
      ? user.displayName.charAt(0).toUpperCase()
      : '?';

  return (
    <Card className="bg-card/80 backdrop-blur-sm hover:border-primary/40 transition-colors">
      <CardContent className="p-6 flex flex-col items-center gap-3 text-center">
        <Avatar className="h-20 w-20 border border-border">
          <AvatarImage src={user.avatarUrl} alt={user.displayName} />
          <AvatarFallback className="bg-primary/20 text-primary text-xl">
            {user.avatarUrl ? (
              initial
            ) : (
              <UserCircle className="h-10 w-10" aria-hidden />
            )}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-1 min-w-0 w-full">
          <h3 className="font-semibold text-base text-foreground truncate">
            {user.displayName}
          </h3>
          {user.dominantFramework ? (
            <Badge variant="secondary" className="max-w-full">
              <span className="truncate">{user.dominantFramework}</span>
            </Badge>
          ) : (
            <p className="text-xs text-muted-foreground italic">
              No framework yet
            </p>
          )}
        </div>
        <Button asChild size="sm" variant="outline" className="mt-2">
          <Link href={`/users/${user.uid}`}>View Profile</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default function DirectoryPage(): React.ReactElement {
  const [allUsers, setAllUsers] = useState<DirectoryUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [frameworkFilter, setFrameworkFilter] = useState<string>(ALL_VALUE);

  // Debounce the search input (250ms).
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput), 250);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Load directory users once on mount. Filtering is done client-side on the
  // loaded list for responsiveness.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getDirectoryUsers({ max: 200 });
        if (cancelled) return;
        if (result.success) {
          setAllUsers(result.data);
        } else {
          setError(result.error);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (!cancelled) setError(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredUsers = useMemo(() => {
    const search = debouncedSearch.trim().toLowerCase();
    return allUsers.filter((u) => {
      if (search && !u.displayName.toLowerCase().includes(search)) return false;
      if (frameworkFilter !== ALL_VALUE && u.dominantFramework !== frameworkFilter) {
        return false;
      }
      return true;
    });
  }, [allUsers, debouncedSearch, frameworkFilter]);

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <h1 className="text-4xl font-bold mb-2 text-primary font-headline flex items-center gap-3">
            <Users className="h-9 w-9" />
            People
          </h1>
          <p className="text-lg text-muted-foreground">
            Discover other ethics explorers, their dominant frameworks, and
            start a conversation.
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Find explorers</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-[1fr_260px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9"
              aria-label="Search by name"
            />
          </div>
          <Select value={frameworkFilter} onValueChange={setFrameworkFilter}>
            <SelectTrigger aria-label="Filter by top framework">
              <SelectValue placeholder="Top Framework" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>All frameworks</SelectItem>
              {FRAMEWORK_OPTIONS.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {error && (
        <Card className="bg-card/80 backdrop-blur-sm border-destructive/50">
          <CardContent className="p-6 text-sm text-destructive">
            {error}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 12 }).map((_, i) => <UserCardSkeleton key={i} />)
        ) : filteredUsers.length === 0 ? (
          <Card className="md:col-span-2 lg:col-span-3 bg-card/80 backdrop-blur-sm">
            <CardContent className="p-8 text-center text-muted-foreground">
              No explorers found matching your filters.
            </CardContent>
          </Card>
        ) : (
          filteredUsers.map((user) => <UserMiniCard key={user.uid} user={user} />)
        )}
      </div>
    </div>
  );
}
