import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2, History, Plus, MessageSquare, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import { supabase } from '@/integrations/supabase/client';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

type ChatSession = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/patient-chat`;

export function PatientChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const createNewChat = useCallback(() => {
    const newSession: ChatSession = {
      id: Math.random().toString(36).substring(7),
      title: 'New Chat',
      messages: [{
        role: 'assistant',
        content: "Hello! I'm Diagnyx AI, your health assistant. I'm here to help you understand your health concerns, answer questions about symptoms, and provide general health information. How can I help you today?",
      }],
      createdAt: Date.now(),
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setIsSidebarOpen(false);
    return newSession.id;
  }, []);

  // Load chat history on mount
  useEffect(() => {
    const saved = localStorage.getItem('diagnyx-chat-sessions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSessions(parsed);
          setActiveSessionId(parsed[0].id);
        } else {
          createNewChat();
        }
      } catch (e) {
        console.error('Failed to parse chat history', e);
        createNewChat();
      }
    } else {
      // Check for old single-session history
      const oldHistory = localStorage.getItem('diagnyx-chat-history');
      if (oldHistory) {
        try {
          const messages = JSON.parse(oldHistory);
          const legacySession: ChatSession = {
            id: 'legacy',
            title: 'Previous Chat',
            messages,
            createdAt: Date.now(),
          };
          setSessions([legacySession]);
          setActiveSessionId('legacy');
          localStorage.removeItem('diagnyx-chat-history');
        } catch {
          createNewChat();
        }
      } else {
        createNewChat();
      }
    }
  }, [createNewChat]);

  // Save chat history whenever sessions change
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('diagnyx-chat-sessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  const activeSession = sessions.find(s => s.id === activeSessionId);
  const messages = activeSession?.messages || [];

  const updateSessionMessages = useCallback((sessionId: string, updater: (prev: Message[]) => Message[]) => {
    setSessions(prev => prev.map(s => {
      if (s.id === sessionId) {
        const newMessages = updater(s.messages);
        let newTitle = s.title;
        // Generate title if it's still "New Chat" and we have a user message
        if (s.title === 'New Chat' || s.title === 'Previous Chat') {
          const firstUserMsg = newMessages.find(m => m.role === 'user');
          if (firstUserMsg) {
            newTitle = firstUserMsg.content.slice(0, 30) + (firstUserMsg.content.length > 30 ? '...' : '');
          }
        }
        return { ...s, messages: newMessages, title: newTitle };
      }
      return s;
    }));
  }, []);

  const deleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newSessions = sessions.filter(s => s.id !== id);
    setSessions(newSessions);
    if (activeSessionId === id) {
      if (newSessions.length > 0) {
        setActiveSessionId(newSessions[0].id);
      } else {
        createNewChat();
      }
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const streamChat = useCallback(
    async (sessionId: string, userMessages: Message[]) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ messages: userMessages }),
      });

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to get response');
      }

      const reader = resp.body?.getReader();
      if (!reader) throw new Error('No response body');
      
      const decoder = new TextDecoder();
      let assistantContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data:')) {
            const jsonStr = line.slice(5).trim();
            if (jsonStr === '[DONE]') continue;

            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content || 
                              parsed.candidates?.[0]?.content?.parts?.[0]?.text;

              if (content) {
                assistantContent += content;
                updateSessionMessages(sessionId, (prev) => {
                  const last = prev[prev.length - 1];
                  if (last?.role === 'assistant' && prev.length > 1) {
                    return prev.map((m, i) =>
                      i === prev.length - 1 ? { ...m, content: assistantContent } : m
                    );
                  }
                  return [...prev, { role: 'assistant', content: assistantContent }];
                });
              }
            } catch (e) {
              // Ignore parse errors for incomplete JSON
            }
          }
        }
      }
    },
    [updateSessionMessages]
  );

  const handleSend = async () => {
    if (!input.trim() || isLoading || !activeSessionId) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    const sessionId = activeSessionId;
    
    updateSessionMessages(sessionId, (prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const updatedSession = sessions.find(s => s.id === sessionId);
      const allMessages = [...(updatedSession?.messages || []), userMessage];
      await streamChat(sessionId, allMessages.slice(1)); // Skip greeting
    } catch (error) {
      console.error('Chat error:', error);
      updateSessionMessages(sessionId, (prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `I'm sorry, I encountered an issue. Error: ${error instanceof Error ? error.message : JSON.stringify(error)}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'fixed bottom-24 right-6 z-50 h-14 w-14 rounded-full shadow-lg transition-all duration-300',
          'bg-primary hover:bg-primary/90',
          isOpen && 'rotate-90'
        )}
        size="icon"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-40 right-6 z-50 w-[500px] max-w-[calc(100vw-3rem)] animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex flex-col h-[600px] max-h-[80vh] rounded-2xl border bg-background shadow-2xl overflow-hidden relative">
            
            {/* Sidebar Overlay */}
            {isSidebarOpen && (
              <div 
                className="absolute inset-0 bg-black/50 z-20 backdrop-blur-[2px]"
                onClick={() => setIsSidebarOpen(false)}
              />
            )}

            {/* Sidebar Content */}
            <div className={cn(
              "absolute inset-y-0 left-0 z-30 w-64 border-r bg-slate-950 text-slate-200 transition-transform duration-300 ease-in-out",
              isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
              <div className="flex flex-col h-full">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                  <span className="font-semibold text-xs uppercase tracking-wider text-slate-500">Your chats</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setIsSidebarOpen(false)}
                    className="h-8 w-8 text-slate-500 hover:text-white hover:bg-slate-900"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="p-3">
                  <Button 
                    onClick={createNewChat}
                    className="w-full justify-start gap-2 bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-200"
                    variant="outline"
                  >
                    <Plus className="h-4 w-4" />
                    New Chat
                  </Button>
                </div>

                <ScrollArea className="flex-1 px-3">
                  <div className="space-y-1 pb-4">
                    {sessions.map((session) => (
                      <div
                        key={session.id}
                        onClick={() => {
                          setActiveSessionId(session.id);
                          setIsSidebarOpen(false);
                        }}
                        className={cn(
                          "group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors text-sm",
                          activeSessionId === session.id 
                            ? "bg-slate-800 text-white" 
                            : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                        )}
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <MessageSquare className="h-4 w-4 shrink-0" />
                          <span className="truncate">{session.title}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => deleteSession(e, session.id)}
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-opacity"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between border-b bg-primary p-4 text-primary-foreground relative z-10 shrink-0">
              <div className="flex items-center gap-3 overflow-hidden">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="text-primary-foreground hover:bg-primary-foreground/10 h-8 w-8 shrink-0"
                >
                  <History className="h-5 w-5" />
                </Button>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/20 shrink-0">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm truncate">
                    {activeSession?.title || 'Diagnyx AI'}
                  </h3>
                  <p className="text-[10px] text-primary-foreground/80 truncate">Your Health Assistant</p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0 ml-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={createNewChat}
                  className="text-primary-foreground hover:bg-primary-foreground/10 h-8 w-8"
                  title="New Chat"
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsOpen(false)}
                  className="text-primary-foreground hover:bg-primary-foreground/10 h-8 w-8"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4 bg-background" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={cn(
                      'flex gap-3',
                      message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {message.role === 'user' ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </div>
                    <div
                      className={cn(
                        'rounded-2xl px-4 py-2 max-w-[80%]',
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground shadow-sm border'
                      )}
                    >
                      <div className="prose prose-sm dark:prose-invert max-w-none break-words">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && messages[messages.length - 1]?.role === 'user' && (
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="rounded-2xl px-4 py-2 bg-muted shadow-sm border">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* InputArea */}
            <div className="border-t p-4 bg-background shrink-0">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your health question..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  size="icon"
                  className="shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="mt-2 text-[10px] text-muted-foreground text-center">
                Not a substitute for professional medical advice
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
