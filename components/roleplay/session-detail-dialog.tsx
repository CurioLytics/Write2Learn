import { useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RoleplaySessionData } from '@/types/roleplay';
import { Bot } from 'lucide-react';
import { MessageBubble } from './message-bubble';

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
                <MessageBubble
                  key={message.id}
                  message={message}
                  roleName={message.sender === 'bot' ? session?.scenario?.ai_role || 'AI' : 'You'}
                  compact={true}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}