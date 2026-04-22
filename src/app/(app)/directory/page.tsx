'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Users, Search, UserCircle, Eye, Loader2, Shield, ShieldCheck } from 'lucide-react';

import {
  getDirectoryUsers,
  type DirectoryUser,
} from '@/app/actions/directory';
import { startImpersonation } from '@/app/actions/impersonation';
import {
  grantCommunityManager,
  revokeCommunityManager,
} from '@/app/actions/community-manager';
import { useAuth } from '@/hooks/use-auth';
import { useAdmin } from '@/hooks/use-admin';
import { useToast } from '@/hooks/use-toast';
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
import { RevealOnScroll } from '@/components/ui/reveal-on-scroll';

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

interface UserMiniCardProps {
  user: DirectoryUser;
  /** When true, render the super-admin "Impersonate" control. */
  showImpersonate: boolean;
  /** Called when the super-admin clicks Impersonate; parent owns the action. */
  onImpersonate?: (uid: string) => void;
  impersonatingUid?: string | null;
  /** When true, render the super-admin "Upgrade / revoke community
   *  manager" control. Parent owns the mutation. */
  showManagerToggle: boolean;
  onToggleManager?: (uid: string, currentlyManager: boolean) => void;
  togglingManagerUid?: string | null;
}

function UserMiniCard({
  user,
  showImpersonate,
  onImpersonate,
  impersonatingUid,
  showManagerToggle,
  onToggleManager,
  togglingManagerUid,
}: UserMiniCardProps): React.ReactElement {
  const initial =
    user.displayName && user.displayName.length > 0
      ? user.displayName.charAt(0).toUpperCase()
      : '?';
  const isImpersonatingThis = impersonatingUid === user.uid;

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
          {user.communityManager && (
            <Badge
              variant="outline"
              className="mt-1 border-primary/50 text-primary max-w-full"
            >
              <ShieldCheck className="h-3 w-3 mr-1" />
              <span className="truncate">Community manager</span>
            </Badge>
          )}
        </div>
        <div className="flex flex-col gap-2 w-full mt-2">
          <Button asChild size="sm" variant="outline">
            <Link href={`/users/${user.uid}`}>View Profile</Link>
          </Button>
          {showImpersonate && (
            <Button
              size="sm"
              variant="ghost"
              className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
              onClick={() => onImpersonate?.(user.uid)}
              disabled={isImpersonatingThis}
            >
              {isImpersonatingThis ? (
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              ) : (
                <Eye className="h-3.5 w-3.5 mr-1.5" />
              )}
              Impersonate User
            </Button>
          )}
          {showManagerToggle && (
            <Button
              size="sm"
              variant="ghost"
              className={
                user.communityManager
                  ? 'text-muted-foreground hover:text-destructive hover:bg-destructive/10'
                  : 'text-primary hover:text-primary hover:bg-primary/10'
              }
              onClick={() =>
                onToggleManager?.(user.uid, user.communityManager === true)
              }
              disabled={togglingManagerUid === user.uid}
              title={
                user.communityManager
                  ? 'Revoke community-manager role'
                  : 'Upgrade this member to community manager'
              }
            >
              {togglingManagerUid === user.uid ? (
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              ) : (
                <Shield className="h-3.5 w-3.5 mr-1.5" />
              )}
              {user.communityManager ? 'Revoke manager' : 'Upgrade to manager'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function DirectoryPage(): React.ReactElement {
  const router = useRouter();
  const { user } = useAuth();
  const { isSuperAdmin } = useAdmin();
  const { toast } = useToast();
  const [allUsers, setAllUsers] = useState<DirectoryUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [frameworkFilter, setFrameworkFilter] = useState<string>(ALL_VALUE);
  const [impersonatingUid, setImpersonatingUid] = useState<string | null>(null);
  const [togglingManagerUid, setTogglingManagerUid] = useState<string | null>(null);

  const handleToggleManager = async (
    targetUid: string,
    currentlyManager: boolean
  ): Promise<void> => {
    if (!user || !isSuperAdmin) return;
    setTogglingManagerUid(targetUid);
    try {
      const res = currentlyManager
        ? await revokeCommunityManager(targetUid, user.uid)
        : await grantCommunityManager(targetUid, user.uid);
      if (res.success) {
        toast({
          title: currentlyManager
            ? 'Community-manager role revoked'
            : 'Member upgraded to community manager',
        });
        // Optimistically update the card without refetching the whole list.
        setAllUsers((prev) =>
          prev.map((u) =>
            u.uid === targetUid
              ? { ...u, communityManager: !currentlyManager }
              : u
          )
        );
      } else {
        toast({
          title: 'Could not update role',
          description: res.error,
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Could not update role',
        description: err instanceof Error ? err.message : String(err),
        variant: 'destructive',
      });
    } finally {
      setTogglingManagerUid(null);
    }
  };

  const handleImpersonate = async (targetUid: string) => {
    if (!user || !isSuperAdmin) return;
    setImpersonatingUid(targetUid);
    try {
      const res = await startImpersonation(user.uid, targetUid);
      if (res.success) {
        toast({
          title: `Now viewing as ${res.data.asName}`,
          description: 'Writes will still be attributed to you.',
        });
        // Hard refresh so every component re-reads cookie state.
        if (typeof window !== 'undefined') window.location.href = '/profile';
        else router.refresh();
      } else {
        toast({
          title: 'Could not start impersonation',
          description: res.error,
          variant: 'destructive',
        });
        setImpersonatingUid(null);
      }
    } catch (err) {
      toast({
        title: 'Could not start impersonation',
        description: err instanceof Error ? err.message : String(err),
        variant: 'destructive',
      });
      setImpersonatingUid(null);
    }
  };

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
          filteredUsers.map((u, i) => (
            <RevealOnScroll
              key={u.uid}
              from="up"
              delay={Math.min(i * 40, 320)}
              distance={12}
              duration={500}
            >
              <UserMiniCard
                user={u}
                showImpersonate={isSuperAdmin && !!user && u.uid !== user.uid}
                onImpersonate={handleImpersonate}
                impersonatingUid={impersonatingUid}
                showManagerToggle={isSuperAdmin && !!user && u.uid !== user.uid}
                onToggleManager={handleToggleManager}
                togglingManagerUid={togglingManagerUid}
              />
            </RevealOnScroll>
          ))
        )}
      </div>
    </div>
  );
}
