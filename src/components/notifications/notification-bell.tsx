'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import {
  Bell,
  FileText,
  CheckCircle2,
  XCircle,
  UserPlus,
  CheckCheck,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import {
  getUnreadCount,
  getUserNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/app/actions/notifications';
import type { AppNotification, NotificationType } from '@/types';

const POLL_INTERVAL_MS = 60_000;
const DROPDOWN_LIMIT = 10;

function NotificationTypeIcon({
  type,
  className,
}: {
  type: NotificationType;
  className?: string;
}): React.ReactElement {
  const iconClass = cn('h-4 w-4 shrink-0', className);
  switch (type) {
    case 'dilemma_submitted':
      return <FileText className={iconClass} />;
    case 'dilemma_approved':
      return <CheckCircle2 className={cn(iconClass, 'text-green-500')} />;
    case 'dilemma_rejected':
      return <XCircle className={cn(iconClass, 'text-red-500')} />;
    case 'community_invite':
      return <UserPlus className={iconClass} />;
    case 'generic':
    default:
      return <Bell className={iconClass} />;
  }
}

function toDate(value: AppNotification['createdAt']): Date {
  if (value instanceof Date) return value;
  if (value && typeof value === 'object' && 'toDate' in value && typeof (value as { toDate: () => Date }).toDate === 'function') {
    try {
      return (value as { toDate: () => Date }).toDate();
    } catch {
      return new Date();
    }
  }
  try {
    return new Date(value as string | number);
  } catch {
    return new Date();
  }
}

export function NotificationBell(): React.ReactElement | null {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refreshUnreadCount = useCallback(async (uid: string) => {
    try {
      const result = await getUnreadCount(uid);
      if (result.success) {
        setUnreadCount(result.data);
      }
    } catch (error) {
      console.error('[NotificationBell] getUnreadCount failed:', error);
    }
  }, []);

  const fetchList = useCallback(async (uid: string) => {
    setListLoading(true);
    try {
      const result = await getUserNotifications(uid, DROPDOWN_LIMIT);
      if (result.success) {
        setNotifications(result.data);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error('[NotificationBell] getUserNotifications failed:', error);
      setNotifications([]);
    } finally {
      setListLoading(false);
    }
  }, []);

  // Poll unread count once user is known.
  useEffect(() => {
    if (loading || !user) return;
    const uid = user.uid;
    void refreshUnreadCount(uid);
    pollTimerRef.current = setInterval(() => {
      void refreshUnreadCount(uid);
    }, POLL_INTERVAL_MS);
    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
  }, [loading, user, refreshUnreadCount]);

  // Load list when popover opens.
  useEffect(() => {
    if (!open || !user) return;
    void fetchList(user.uid);
  }, [open, user, fetchList]);

  const handleNotificationClick = useCallback(
    async (n: AppNotification) => {
      // Optimistic mark as read
      if (!n.read) {
        setNotifications((prev) =>
          prev.map((item) => (item.id === n.id ? { ...item, read: true } : item))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
        try {
          await markNotificationRead(n.id);
        } catch (error) {
          console.error('[NotificationBell] markNotificationRead failed:', error);
        }
      }
      setOpen(false);
      if (n.link) {
        router.push(n.link);
      }
    },
    [router]
  );

  const handleMarkAll = useCallback(async () => {
    if (!user) return;
    const uid = user.uid;
    // Optimistic
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    try {
      await markAllNotificationsRead(uid);
    } catch (error) {
      console.error('[NotificationBell] markAllNotificationsRead failed:', error);
    }
  }, [user]);

  if (loading || !user) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={
            unreadCount > 0
              ? `Notifications, ${unreadCount} unread`
              : 'Notifications'
          }
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-semibold"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[360px] p-0 bg-card/95 backdrop-blur-sm"
      >
        <div className="flex items-center justify-between px-4 py-3">
          <div className="text-sm font-semibold">Notifications</div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={handleMarkAll}
            disabled={unreadCount === 0}
          >
            <CheckCheck className="mr-1 h-3.5 w-3.5" />
            Mark all as read
          </Button>
        </div>
        <Separator />
        <ScrollArea className="max-h-[400px]">
          {listLoading ? (
            <div className="p-4 text-sm text-muted-foreground">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 p-8 text-center">
              <Bell className="h-8 w-8 text-muted-foreground/60" />
              <p className="text-sm text-muted-foreground">
                No notifications yet
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {notifications.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => handleNotificationClick(n)}
                    className={cn(
                      'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/50',
                      !n.read && 'bg-primary/10'
                    )}
                  >
                    <div className="mt-0.5">
                      <NotificationTypeIcon type={n.type} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-sm font-semibold">
                          {n.title}
                        </p>
                        {!n.read && (
                          <span
                            className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary"
                            aria-label="Unread"
                          />
                        )}
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                        {n.body}
                      </p>
                      <p className="mt-1 text-[11px] text-muted-foreground/80">
                        {formatDistanceToNow(toDate(n.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
        <Separator />
        <div className="p-2">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="w-full justify-center text-xs"
            onClick={() => setOpen(false)}
          >
            <Link href="/notifications">See all notifications</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default NotificationBell;
