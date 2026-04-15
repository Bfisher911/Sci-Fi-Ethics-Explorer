'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import {
  Bell,
  FileText,
  CheckCircle2,
  XCircle,
  UserPlus,
  Check,
  Trash2,
} from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { AppNotification, NotificationType } from '@/types';

interface NotificationListProps {
  notifications: AppNotification[];
  onMarkRead: (notificationId: string) => void | Promise<void>;
  onDelete: (notificationId: string) => void | Promise<void>;
}

function NotificationTypeIcon({
  type,
  className,
}: {
  type: NotificationType;
  className?: string;
}): React.ReactElement {
  const iconClass = cn('h-5 w-5 shrink-0', className);
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
  if (
    value &&
    typeof value === 'object' &&
    'toDate' in value &&
    typeof (value as { toDate: () => Date }).toDate === 'function'
  ) {
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

export function NotificationList({
  notifications,
  onMarkRead,
  onDelete,
}: NotificationListProps): React.ReactElement {
  const router = useRouter();

  const handleCardClick = async (n: AppNotification): Promise<void> => {
    if (!n.read) {
      await onMarkRead(n.id);
    }
    if (n.link) {
      router.push(n.link);
    }
  };

  if (notifications.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center gap-3 p-12 text-center bg-card/80 backdrop-blur-sm">
        <Bell className="h-10 w-10 text-muted-foreground/60" />
        <p className="text-sm text-muted-foreground">No notifications yet</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map((n) => (
        <Card
          key={n.id}
          role="button"
          tabIndex={0}
          onClick={() => {
            void handleCardClick(n);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              void handleCardClick(n);
            }
          }}
          className={cn(
            'flex cursor-pointer items-start gap-3 p-4 transition-colors bg-card/80 backdrop-blur-sm hover:bg-accent/40',
            !n.read && 'bg-primary/20 hover:bg-primary/25'
          )}
        >
          <div className="mt-0.5">
            <NotificationTypeIcon type={n.type} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <p className="truncate text-sm font-semibold">{n.title}</p>
              <span className="shrink-0 text-[11px] text-muted-foreground">
                {formatDistanceToNow(toDate(n.createdAt), { addSuffix: true })}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>
            <div className="mt-3 flex items-center gap-2">
              {!n.read && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    void onMarkRead(n.id);
                  }}
                >
                  <Check className="mr-1 h-3.5 w-3.5" />
                  Mark as read
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  void onDelete(n.id);
                }}
              >
                <Trash2 className="mr-1 h-3.5 w-3.5" />
                Delete
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export default NotificationList;
