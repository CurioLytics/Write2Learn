'use client';

import { useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RoleplaySessionData } from '@/services/roleplay-session-service';
import { Bot, User } from 'lucide-react';

interface SessionDetailDialogProps {
  session: RoleplaySessionData | null;
  onClose: () => void;
}

export function SessionDetailDialog({ session, onClose }: SessionDetailDialogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when dialog opens
  useEffect(() => {
    if (scrollRef.current && session) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [session]);

  return (
    <Dialog open={!!session} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            {session?.scenario_name || 'Session Details'}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 py-4" ref={scrollRef}>
          <div className="space-y-4">
            {session?.messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No messages in this session
              </div>
            ) : (
              session?.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.sender === 'user' ? 'bg-black' : 'bg-gray-200'
                    }`}
                  >
                    {message.sender === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-gray-700" />
                    )}
                  </div>

                  <div
                    className={`flex flex-col ${
                      message.sender === 'user' ? 'items-end' : 'items-start'
                    } max-w-[70%]`}
                  >
                    <div
                      className={`rounded-2xl px-4 py-3 shadow-sm ${
                        message.sender === 'user'
                          ? 'bg-black text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p>{message.content}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}