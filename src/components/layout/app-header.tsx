
'use client';

import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Moon,
  Sun,
  User as UserIcon,
  LogOut,
  Search as SearchIcon,
  PanelLeft,
  MessageCircle,
  Route as RouteIcon,
  Bookmark,
  Gem,
  CreditCard,
  HelpCircle,
} from 'lucide-react';
import { hasOwnedLicenses } from '@/app/actions/scope';
import { JourneyTourDialog } from './journey-tour-dialog';
import { useAuth } from '@/hooks/use-auth';
import { auth } from '@/lib/firebase/config';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useSidebar } from '@/components/ui/sidebar';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GlobalSearch } from '@/components/search/global-search';
import { NotificationBell } from '@/components/notifications/notification-bell';
import { Badge } from '@/components/ui/badge';
import { getUnreadMessageCount } from '@/app/actions/messages';

const UNREAD_MESSAGES_POLL_MS = 30_000;

function MessagesIndicator(): React.ReactElement | null {
  const { user, loading } = useAuth();
  const [count, setCount] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (loading || !user) return;
    const uid = user.uid;
    let cancelled = false;

    const fetchCount = async () => {
      try {
        const result = await getUnreadMessageCount(uid);
        if (!cancelled && result.success) {
          setCount(result.data);
        }
      } catch (err) {
        // non-fatal; another poll will try again
        console.error('[MessagesIndicator] getUnreadMessageCount failed:', err);
      }
    };

    void fetchCount();
    timerRef.current = setInterval(fetchCount, UNREAD_MESSAGES_POLL_MS);
    return () => {
      cancelled = true;
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [loading, user]);

  if (loading || !user) return null;

  return (
    <Button
      asChild
      variant="ghost"
      size="icon"
      className="relative"
      aria-label={count > 0 ? `Messages, ${count} unread` : 'Messages'}
    >
      <Link href="/messages">
        <MessageCircle className="h-5 w-5" />
        {count > 0 && (
          <Badge
            variant="destructive"
            className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-semibold"
          >
            {count > 99 ? '99+' : count}
          </Badge>
        )}
      </Link>
    </Button>
  );
}

export function AppHeader() {
  const { user } = useAuth();
  const router = useRouter();
  const { toggleSidebar, isMobile } = useSidebar();

  const [isDarkMode, setIsDarkMode] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);

  // Cmd+K / Ctrl+K opens the global search omnibox from anywhere in
  // the app. Skip the shortcut when a text input or contenteditable
  // surface is focused so it doesn't hijack typing.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const isCmdK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k';
      if (!isCmdK) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        // user is typing into an actual editor — don't steal the key
        return;
      }
      e.preventDefault();
      setSearchOpen(true);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  // Whether the signed-in user owns at least one license. Gates the
  // "Billing & Seats" entry in the user menu — members with a claimed
  // seat (but no license of their own) shouldn't see billing surfaces.
  const [licenseAdmin, setLicenseAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) {
      setLicenseAdmin(false);
      return;
    }
    let cancelled = false;
    hasOwnedLicenses(user.uid).then((res) => {
      if (cancelled) return;
      setLicenseAdmin(res.success ? res.data : false);
    });
    return () => {
      cancelled = true;
    };
  }, [user]);

  // Sync theme from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('theme');
    if (stored === 'light') {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    } else if (stored === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      // Check if DOM already has dark class
      const hasDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(hasDark);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const newDark = !isDarkMode;
    setIsDarkMode(newDark);
    document.documentElement.classList.toggle('dark', newDark);
    localStorage.setItem('theme', newDark ? 'dark' : 'light');
  }, [isDarkMode]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
        {isMobile && (
           <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden">
              <PanelLeft className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
        )}
        <div className="flex-1">
          {/* Spacer */}
        </div>
        <div className="flex items-center gap-4">
          <JourneyTourDialog
            trigger={
              <Button
                variant="ghost"
                size="sm"
                aria-label="Take the tour"
                className="gap-1.5 text-xs uppercase tracking-wider"
              >
                <RouteIcon className="h-4 w-4 text-primary" />
                <span className="hidden sm:inline">Tour</span>
              </Button>
            }
          />
          {/* Search button with a discoverable Cmd+K hint. The hint
              is hidden on small screens to save space; on desktop it
              advertises the shortcut so users learn it. */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchOpen(true)}
            aria-label="Search (Cmd+K)"
            className="gap-2"
          >
            <SearchIcon className="h-4 w-4" />
            <span className="hidden lg:inline text-xs text-muted-foreground">
              Search
            </span>
            <kbd className="hidden lg:inline-flex h-5 items-center gap-0.5 rounded border border-border/60 bg-muted/40 px-1.5 font-mono text-[10px] text-muted-foreground">
              <span className="text-[11px]">⌘</span>K
            </kbd>
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <MessagesIndicator />
          <NotificationBell />
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.email || 'User'} />
                    <AvatarFallback>
                      {user.displayName ? user.displayName.charAt(0).toUpperCase() : <UserIcon className="h-5 w-5" />}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="truncate">
                  {user.displayName || user.email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/me">
                    <UserIcon className="mr-2 h-4 w-4" />
                    My journey
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <UserIcon className="mr-2 h-4 w-4" />
                    Profile settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/bookmarks">
                    <Bookmark className="mr-2 h-4 w-4" />
                    Saved
                  </Link>
                </DropdownMenuItem>
                {/* Billing only renders for license owners. A member
                    with a claimed seat shouldn't see seat-management
                    UI for someone else's license. */}
                {licenseAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/billing">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Billing &amp; Seats
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/pricing">
                    <Gem className="mr-2 h-4 w-4" />
                    Pricing &amp; Plans
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/help">
                    <HelpCircle className="mr-2 h-4 w-4" />
                    Help
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="outline">
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>
      </header>
      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
