'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { MessageBubble } from './message-bubble';
import { roleplayWebhookService } from '@/services/roleplay-webhook-service';
import { roleplaySessionService } from '@/services/roleplay-session-service';
import { useAuth } from '@/hooks/auth/use-auth';
import { RoleplayMessage, RoleplayScenario } from '@/types/roleplay';
import styles from './roleplay.module.css';

interface ChatInterfaceProps {
  scenario: RoleplayScenario;
}

export function ChatInterface({ scenario }: ChatInterfaceProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [messages, setMessages] = useState<RoleplayMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
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
        { id: `err-${Date.now()}`, content: 'Xin lỗi, phản hồi bị lỗi.', sender: 'bot', timestamp: Date.now() },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinish = async () => {
    setFinishing(true);
    try {
      // Save session to database first
      if (user?.id && messages.length > 1) {
        await roleplaySessionService.saveSession(user.id, scenario, messages);
      }

      // Then call the existing webhook
      const res = await fetch('/api/roleplay/finish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
      });

      const text = await res.text();
      setSummary(text);
      
      // Navigate back to roleplay page after a short delay
      setTimeout(() => {
        router.push('/roleplay');
      }, 2000);
    } catch (error) {
      console.error('Error finishing roleplay session:', error);
      setSummary('Lỗi khi lưu phiên hội thoại.');
    } finally {
      setFinishing(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="font-medium text-gray-800">{scenario.name}</h2>
        <Button
          onClick={handleFinish}
          disabled={finishing || messages.length <= 1}
          variant="outline"
          className="text-sm"
        >
          {finishing ? 'Finishing...' : 'Finish'}
        </Button>
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

      {/* Webhook result */}
      {summary && (
        <div className="p-3 bg-gray-100 text-sm text-center text-gray-700 border-t">
          {summary}
        </div>
      )}

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