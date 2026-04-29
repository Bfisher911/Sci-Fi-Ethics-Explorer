'use client';

import { useState } from 'react';
import type { ChatSession } from '@/types';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Plus, MessageSquare, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatSessionListProps {
  sessions: ChatSession[];
  activeSessionId?: string;
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;
  onDeleteSession: (sessionId: string) => void;
}

export function ChatSessionList({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
}: ChatSessionListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const formatDate = (date: Date | any): string => {
    const d = date instanceof Date ? date : new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (diffDays === 1) {
      return 'Yesterday';
    }
    if (diffDays < 7) {
      return d.toLocaleDateString([], { weekday: 'short' });
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const handleDelete = (sessionId: string) => {
    setDeletingId(null);
    onDeleteSession(sessionId);
  };

  return (
    <div className="flex flex-col h-full bg-card/60 backdrop-blur-sm rounded-lg border">
      <div className="p-3 border-b">
        <Button
          onClick={onNewChat}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
          size="sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Chat
        </Button>
      </div>

      <ScrollArea className="flex-grow">
        <div className="p-2 space-y-1">
          {sessions.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6 px-2">
              No chat history yet. Start a new conversation!
            </p>
          )}
          {sessions.map((session) => (
            <div
              key={session.id}
              className={cn(
                'group flex items-center gap-2 rounded-md px-3 py-2 cursor-pointer transition-colors',
                activeSessionId === session.id
                  ? 'bg-primary/15 border border-primary/30'
                  : 'hover:bg-muted/50'
              )}
              onClick={() => onSelectSession(session.id)}
            >
              <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="flex-grow min-w-0">
                <p className="text-sm font-medium truncate text-foreground">
                  {session.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(session.lastMessageAt)}
                </p>
              </div>

              <AlertDialog
                open={deletingId === session.id}
                onOpenChange={(open) => {
                  if (!open) setDeletingId(null);
                }}
              >
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingId(session.id);
                    }}
                    aria-label="Delete chat session"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Chat Session</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete &quot;{session.title}&quot;? This action
                      cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(session.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
