'use client';

import { useEffect, useState, useCallback } from 'react';
import { AICounselorChat } from '@/components/ai-counselor/ai-counselor-chat';
import { ChatSessionList } from '@/components/ai-counselor/chat-session-list';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import {
  saveChatSession,
  getChatSessions,
  getChatSessionById,
  deleteChatSession,
} from '@/app/actions/chat';
import type { ChatSession, ChatMessage } from '@/types';

export default function AICounselorPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | undefined>(undefined);
  const [activeMessages, setActiveMessages] = useState<ChatMessage[] | undefined>(undefined);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);

  const loadSessions = useCallback(async () => {
    if (!user?.uid) return;
    setIsLoadingSessions(true);
    try {
      const result = await getChatSessions(user.uid);
      if (result.success) {
        setSessions(result.data);
      }
    } catch (err) {
      console.error('Failed to load chat sessions:', err);
    } finally {
      setIsLoadingSessions(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const handleSelectSession = async (sessionId: string) => {
    try {
      const result = await getChatSessionById(sessionId);
      if (result.success && result.data) {
        setActiveSessionId(result.data.id);
        setActiveMessages(result.data.messages);
      }
    } catch (err) {
      console.error('Failed to load session:', err);
    }
  };

  const handleNewChat = () => {
    setActiveSessionId(undefined);
    setActiveMessages(undefined);
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!user?.uid) return;
    try {
      const result = await deleteChatSession(sessionId, user.uid);
      if (result.success) {
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        if (activeSessionId === sessionId) {
          setActiveSessionId(undefined);
          setActiveMessages(undefined);
        }
      }
    } catch (err) {
      console.error('Failed to delete session:', err);
    }
  };

  const handleMessagesUpdate = async (messages: ChatMessage[]) => {
    if (!user?.uid) return;

    // Generate a title from the first user message
    const firstUserMsg = messages.find((m) => m.role === 'user');
    const title = firstUserMsg
      ? firstUserMsg.content.substring(0, 60) + (firstUserMsg.content.length > 60 ? '...' : '')
      : 'New Chat';

    try {
      const result = await saveChatSession({
        id: activeSessionId,
        userId: user.uid,
        title,
        messages,
      });

      if (result.success) {
        const savedId = result.data.id;
        if (!activeSessionId) {
          setActiveSessionId(savedId);
        }
        // Refresh session list
        await loadSessions();
      }
    } catch (err) {
      console.error('Failed to save chat session:', err);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 flex flex-col h-[calc(100vh-var(--header-height,10rem))]">
      <Card className="mb-8 p-6 bg-card/80 backdrop-blur-sm">
        <CardContent className="p-0">
          <h1 className="text-4xl font-bold mb-4 text-primary font-headline">AI Ethics Counselor</h1>
          <p className="text-lg text-muted-foreground">
            Discuss your ethical dilemmas, explore different perspectives, and gain insights from our specialized AI counselor.
            Start by typing your question or concern below.
          </p>
        </CardContent>
      </Card>

      <div className="flex-grow flex gap-4 min-h-0">
        {user && (
          <div className="w-64 shrink-0 hidden md:block">
            <ChatSessionList
              sessions={sessions}
              activeSessionId={activeSessionId}
              onSelectSession={handleSelectSession}
              onNewChat={handleNewChat}
              onDeleteSession={handleDeleteSession}
            />
          </div>
        )}

        <div className="flex-grow flex flex-col min-w-0">
          <AICounselorChat
            key={activeSessionId ?? 'new'}
            sessionId={activeSessionId}
            initialMessages={activeMessages}
            onMessagesUpdate={handleMessagesUpdate}
          />
        </div>
      </div>
    </div>
  );
}
