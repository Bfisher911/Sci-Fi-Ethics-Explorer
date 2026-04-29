'use client';

import { useEffect, useState, useRef, type FormEvent } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase/config';
import {
  collection,
  doc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { joinWorkshop, sendWorkshopMessage } from '@/app/actions/workshops';
import type { Workshop, WorkshopMessage } from '@/types';
import { ParticipantPanel } from '@/components/workshops/participant-panel';
import { SharedNotes } from '@/components/workshops/shared-notes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Loader2, MessageCircle, LogIn, Video, MapPin, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WorkshopRoomProps {
  workshop: Workshop;
}

/**
 * Live workshop room with participants, shared notes, and chat.
 */
export function WorkshopRoom({ workshop }: WorkshopRoomProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<WorkshopMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  const [joining, setJoining] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isParticipant = user
    ? workshop.participantIds.includes(user.uid)
    : false;

  // Listen for chat messages in real time
  useEffect(() => {
    if (!db) return;

    const messagesQuery = query(
      collection(db, 'workshops', workshop.id, 'messages'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const msgs: WorkshopMessage[] = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          workshopId: d.workshopId,
          authorId: d.authorId,
          authorName: d.authorName,
          content: d.content,
          createdAt: d.createdAt?.toDate?.() ?? new Date(),
        };
      });
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [workshop.id]);

  // Auto-scroll chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const handleJoin = async () => {
    if (!user) return;
    setJoining(true);
    try {
      const result = await joinWorkshop(workshop.id, user.uid);
      if (result.success) {
        toast({ title: 'Joined', description: 'You have joined the workshop.' });
      } else {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to join workshop:', error);
    } finally {
      setJoining(false);
    }
  };

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !messageInput.trim() || sending) return;

    setSending(true);
    try {
      await sendWorkshopMessage({
        workshopId: workshop.id,
        authorId: user.uid,
        authorName: user.displayName ?? 'Anonymous',
        content: messageInput.trim(),
      });
      setMessageInput('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <h1 className="text-2xl font-bold text-primary font-headline">
            {workshop.title}
          </h1>
          <p className="text-muted-foreground mt-1">{workshop.description}</p>
          <p className="text-xs text-muted-foreground mt-2">
            Hosted by {workshop.hostName}
          </p>

          {(workshop.meetingUrl || workshop.locationAddress) && (
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              {workshop.meetingUrl && (
                <Button
                  asChild
                  variant="default"
                  className="gap-2 bg-primary hover:bg-primary/90"
                >
                  <a
                    href={workshop.meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Video className="h-4 w-4" /> Join Meeting
                    <ExternalLink className="h-3.5 w-3.5 opacity-70" />
                  </a>
                </Button>
              )}
              {workshop.locationAddress && (
                <div className="flex items-center gap-2 text-sm text-foreground/90">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>{workshop.locationAddress}</span>
                </div>
              )}
            </div>
          )}

          {!isParticipant && user && (
            <Button onClick={handleJoin} disabled={joining} className="mt-4 gap-2">
              {joining ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogIn className="h-4 w-4" />
              )}
              Join Workshop
            </Button>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <ParticipantPanel workshopId={workshop.id} />
        </div>

        {/* Main area */}
        <div className="lg:col-span-3 space-y-4">
          <SharedNotes workshopId={workshop.id} />

          {/* Chat */}
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-primary" />
                Workshop Chat
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ScrollArea className="h-[300px] pr-4" ref={scrollRef}>
                <div className="space-y-3">
                  {messages.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No messages yet. Start the conversation!
                    </p>
                  ) : (
                    messages.map((msg) => (
                      <div key={msg.id} className="text-sm">
                        <span className="font-semibold text-primary">
                          {msg.authorName}:
                        </span>{' '}
                        <span>{msg.content}</span>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>

              {isParticipant && (
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type a message..."
                    disabled={sending}
                    aria-label="Workshop chat message"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={sending || !messageInput.trim()}
                    aria-label="Send message"
                  >
                    {sending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
