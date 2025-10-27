'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { MessageBubble } from './message-bubble';
import { roleplayWebhookService } from '@/services/api/roleplay-webhook-service';
import { RoleplayMessage, RoleplayScenario } from '@/types/roleplay';
import styles from './roleplay.module.css';

interface ChatInterfaceProps {
  scenario: RoleplayScenario;
}

export function ChatInterface({ scenario }: ChatInterfaceProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<RoleplayMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([
      { id: 'intro', content: scenario.starter_message, sender: 'bot', timestamp: Date.now() },
    ]);
  }, [scenario]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMsg: RoleplayMessage = {
      id: `user-${Date.now()}`,
      content: inputValue,
      sender: 'user',
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const reply = await roleplayWebhookService.getBotResponse(scenario, [...messages, userMsg]);
      setMessages((prev) => [
        ...prev,
        { id: `bot-${Date.now()}`, content: reply, sender: 'bot', timestamp: Date.now() },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          content: "Xin lỗi, phản hồi bị lỗi. Hãy thử lại.",
          sender: 'bot',
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinish = () => {
    router.push('/roleplay');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b flex justify-between items-center">
        <div className="flex items-center gap-2">
          <button onClick={() => router.push('/roleplay')} className="text-gray-600 hover:text-gray-900">
            ←
          </button>
          <h2 className="font-medium text-gray-800">{scenario.name}</h2>
        </div>
        <Button
          onClick={handleFinish}
          className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-4 py-1 text-sm"
        >
          Finish
        </Button>
      </div>

      {/* Context */}
      <div className="px-4 py-2 bg-gray-50 text-sm text-gray-600">
        <strong>Context:</strong> {scenario.context}
      </div>

      {/* Chat messages */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {messages.map((m) => (
          <MessageBubble
            key={m.id}
            message={m}
            roleName={m.sender === 'bot' ? scenario.role1 : 'You'}
          />
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-gray-500 text-sm mt-2">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-medium">
              {scenario.role1[0].toUpperCase()}
            </div>
            <div className={styles.typingIndicator}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-gray-300"
          placeholder="Type your message..."
          disabled={isLoading}
        />
        <Button
          type="submit"
          disabled={!inputValue.trim() || isLoading}
          className="bg-gray-900 hover:bg-gray-800 rounded-full w-10 h-10 p-0 text-white flex items-center justify-center"
        >
          →
        </Button>
      </form>
    </div>
  );
}
