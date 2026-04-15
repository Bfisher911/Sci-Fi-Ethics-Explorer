
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
import { Moon, Sun, User as UserIcon, LogOut, Search as SearchIcon, PanelLeft } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { auth } from '@/lib/firebase/config';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useSidebar } from '@/components/ui/sidebar';
import React, { useEffect, useState, useCallback } from 'react';
import { GlobalSearch } from '@/components/search/global-search';
import { NotificationBell } from '@/components/notifications/notification-bell';

export function AppHeader() {
  const { user } = useAuth();
  const router = useRouter();
  const { toggleSidebar, isMobile } = useSidebar();

  const [isDarkMode, setIsDarkMode] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);

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
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSearchOpen(true)}
            aria-label="Search (Cmd+K)"
          >
            <SearchIcon className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
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
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user.displayName || user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
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
