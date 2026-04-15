'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BellRing, CheckCheck } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { NotificationList } from '@/components/notifications/notification-list';
import {
  deleteNotification,
  getUserNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/app/actions/notifications';
import type { AppNotification } from '@/types';

export default function NotificationsPage(): React.ReactElement {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    const uid = user.uid;
    let cancelled = false;
    async function fetchAll(): Promise<void> {
      setLoading(true);
      try {
        const result = await getUserNotifications(uid, 100);
        if (!cancelled) {
          if (result.success) {
            setNotifications(result.data);
          } else {
            setNotifications([]);
          }
        }
      } catch (error) {
        console.error('[NotificationsPage] fetch failed:', error);
        if (!cancelled) setNotifications([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void fetchAll();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading, router]);

  const handleMarkRead = useCallback(
    async (notificationId: string): Promise<void> => {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      try {
        const result = await markNotificationRead(notificationId);
        if (!result.success) {
          toast({
            title: 'Failed to mark as read',
            description: result.error,
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('[NotificationsPage] markNotificationRead failed:', error);
      }
    },
    [toast]
  );

  const handleDelete = useCallback(
    async (notificationId: string): Promise<void> => {
      const previous = notifications;
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      try {
        const result = await deleteNotification(notificationId);
        if (!result.success) {
          setNotifications(previous);
          toast({
            title: 'Failed to delete notification',
            description: result.error,
            variant: 'destructive',
          });
        } else {
          toast({ title: 'Notification deleted' });
        }
      } catch (error) {
        console.error('[NotificationsPage] deleteNotification failed:', error);
        setNotifications(previous);
      }
    },
    [notifications, toast]
  );

  const handleMarkAll = useCallback(async (): Promise<void> => {
    if (!user) return;
    const previous = notifications;
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      const result = await markAllNotificationsRead(user.uid);
      if (!result.success) {
        setNotifications(previous);
        toast({
          title: 'Failed to mark all as read',
          description: result.error,
          variant: 'destructive',
        });
      } else {
        toast({ title: 'All notifications marked as read' });
      }
    } catch (error) {
      console.error('[NotificationsPage] markAllNotificationsRead failed:', error);
      setNotifications(previous);
    }
  }, [user, notifications, toast]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mb-8 p-6 bg-card/80 backdrop-blur-sm">
        <CardContent className="p-0">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 text-primary font-headline">
                Notifications
              </h1>
              <p className="text-lg text-muted-foreground">
                Stay up to date with activity on your dilemmas, communities, and
                more.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleMarkAll}
              disabled={unreadCount === 0 || loading}
            >
              <CheckCheck className="mr-2 h-4 w-4" />
              Mark all as read
            </Button>
          </div>
        </CardContent>
      </Card>

      {authLoading || loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-3 p-16 text-center bg-card/80 backdrop-blur-sm">
          <BellRing className="h-12 w-12 text-muted-foreground/60" />
          <p className="text-base font-medium">No notifications yet</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            When someone invites you to a community, responds to a dilemma, or
            there is activity you should know about, it will show up here.
          </p>
        </Card>
      ) : (
        <NotificationList
          notifications={notifications}
          onMarkRead={handleMarkRead}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
