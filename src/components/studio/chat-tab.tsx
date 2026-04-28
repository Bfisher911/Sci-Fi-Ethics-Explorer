'use client';

/**
 * Studio · Chat tab — the AI Counselor experience extracted from
 * `(app)/ai-counselor/page.tsx` so it can be reused both by the legacy
 * route and by the new /studio hub. State / behavior identical to the
 * standalone page.
 */

import { useEffect, useState, useCallback } from 'react';
import { AICounselorChat } from '@/components/ai-counselor/ai-counselor-chat';
import { ChatSessionList } from '@/components/ai-counselor/chat-session-list';
import { useAuth } from '@/hooks/use-auth';
import {
  saveChatSession,
  getChatSessions,
  getChatSessionById,
  deleteChatSession,
} from '@/app/actions/chat';
import type { ChatSession, ChatMessage } from '@/types';

export function ChatTab() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | undefined>(undefined);
  const [activeMessages, setActiveMessages] = useState<ChatMessage[] | undefined>(undefined);
  const [, setIsLoadingSessions] = useState(false);

  const loadSessions = useCallback(async () => {
    if (!user?.uid) return;
    setIsLoadingSessions(true);
    try {
      const result = await getChatSessions(user.uid);
      if (result.success) setSessions(result.data);
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
    const firstUserMsg = messages.find((m) => m.role === 'user');
    const title = firstUserMsg
      ? firstUserMsg.content.substring(0, 60) +
        (firstUserMsg.content.length > 60 ? '...' : '')
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
        if (!activeSessionId) setActiveSessionId(savedId);
        await loadSessions();
      }
    } catch (err) {
      console.error('Failed to save chat session:', err);
    }
  };

  return (
    <div className="flex gap-4 min-h-[600px]">
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
  );
}
