'use client';

import { useState, useRef, useEffect, type FormEvent } from 'react';
import type { ChatMessage } from '@/types';
import { chatWithCounselor, type ChatWithCounselorOutput } from '@/ai/flows/chat-with-counselor';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, User, Send, Loader2, AlertCircle, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DevilsAdvocateToggle } from '@/components/ai-counselor/devils-advocate-toggle';

interface AICounselorChatProps {
  sessionId?: string;
  initialMessages?: ChatMessage[];
  onMessagesUpdate?: (messages: ChatMessage[]) => void;
}

export function AICounselorChat({ sessionId, initialMessages, onMessagesUpdate }: AICounselorChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages ?? []);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quotaInfo, setQuotaInfo] = useState<string | null>(null);
  const [devilsAdvocateMode, setDevilsAdvocateMode] = useState(false);

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  // When initialMessages or sessionId changes, update messages
  useEffect(() => {
    if (initialMessages && initialMessages.length > 0) {
      setMessages(initialMessages);
    } else {
      setMessages([
        {
          id: 'initial-greeting',
          role: 'assistant',
          content: "Hello! I am an AI Ethics Counselor specializing in sci-fi scenarios. How can I help you explore an ethical dilemma today?",
          timestamp: new Date(),
        },
      ]);
    }
  }, [sessionId, initialMessages]);


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString() + '-user',
      role: 'user',
      content: input,
      timestamp: new Date(),
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);
    setQuotaInfo(null);

    try {
      const flowInputMessages = [...messages, userMessage].map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }));
      const result = await chatWithCounselor({ messages: flowInputMessages, mode: devilsAdvocateMode ? 'devils-advocate' : 'counselor' });
      
      const aiResponse: ChatMessage = {
        id: Date.now().toString() + '-assistant',
        role: 'assistant',
        content: result.response,
        timestamp: new Date(),
      };
      const updatedMessages = [...messages, userMessage, aiResponse];
      setMessages(updatedMessages);
      onMessagesUpdate?.(updatedMessages);
      
      // Genkit flows don't typically return quota info in this structure, this is a placeholder
      // if (result.quotaInformation) { 
      //   setQuotaInfo(result.quotaInformation);
      // }

    } catch (err: any) {
      console.error("Error chatting with counselor:", err);
      const rawMessage: string = err?.message ?? '';
      const isSanitizedServerError =
        rawMessage.includes('Server Components render') ||
        rawMessage.includes('digest property') ||
        rawMessage.includes('omitted in production');
      const friendlyMessage = isSanitizedServerError
        ? "The AI counselor is temporarily unavailable. Please try again in a moment."
        : rawMessage || "Failed to get response from AI counselor. Please try again.";
      setError(friendlyMessage);
      const errorResponse: ChatMessage = {
        id: Date.now().toString() + '-error',
        role: 'assistant',
        content: "I'm sorry, I encountered an error trying to process your request. Please try again later.",
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-card/70 backdrop-blur-sm rounded-lg shadow-xl overflow-hidden">
      <div className="flex items-center justify-between border-b px-4 py-2 bg-background/50">
        <span className="text-sm font-medium text-muted-foreground">
          {devilsAdvocateMode ? "Devil's Advocate Mode" : 'AI Ethics Counselor'}
        </span>
        <DevilsAdvocateToggle
          enabled={devilsAdvocateMode}
          onToggle={setDevilsAdvocateMode}
        />
      </div>
      <ScrollArea className="flex-grow p-4 md:p-6" ref={scrollAreaRef}>
        <div className="space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex items-start gap-3',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'assistant' && (
                <Avatar className="h-8 w-8 border-2 border-accent">
                  <AvatarFallback><Bot className="text-accent" /></AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  'max-w-[70%] rounded-xl px-4 py-3 shadow-md text-sm md:text-base',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground'
                )}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs opacity-70 mt-1.5 text-right">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              {message.role === 'user' && (
                <Avatar className="h-8 w-8 border-2 border-primary">
                  <AvatarFallback><User className="text-primary" /></AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {isLoading && messages[messages.length -1]?.role === 'user' && (
             <div className="flex items-start gap-3 justify-start">
                <Avatar className="h-8 w-8 border-2 border-accent">
                  <AvatarFallback><Bot className="text-accent" /></AvatarFallback>
                </Avatar>
                <div className="max-w-[70%] rounded-xl px-4 py-3 shadow-md text-sm md:text-base bg-secondary text-secondary-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                </div>
             </div>
          )}
        </div>
      </ScrollArea>

      {error && (
        <Alert variant="destructive" className="m-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Chat Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {quotaInfo && (
        <Alert variant="default" className="m-4 bg-muted text-muted-foreground">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Quota Information</AlertTitle>
          <AlertDescription>{quotaInfo}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="border-t p-4 bg-background/50 sticky bottom-0 z-10">
        <div className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="Ask about an ethical dilemma..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-grow focus:ring-accent"
            disabled={isLoading}
            aria-label="Chat input"
          />
          <Button type="submit" size="icon" className="bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isLoading || !input.trim()} aria-label="Send message">
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </Button>
        </div>
      </form>
    </div>
  );
}
