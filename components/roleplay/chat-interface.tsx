'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
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
    setError(null);
    setFeedback(null);
    setSummary(null);
    
    try {
      // Save session to database first
      let sessionId: string | undefined;
      if (user?.id && messages.length > 1) {
        sessionId = await roleplaySessionService.saveSession(user.id, scenario, messages);
      }

      // Generate feedback assessment
      try {
        const feedbackRes = await fetch('/api/roleplay/assessment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scenario, messages }),
        });

        if (feedbackRes.ok) {
          const { feedback: feedbackText } = await feedbackRes.json();
          setFeedback(feedbackText);
          
          // Save feedback to database if session was created
          if (sessionId && feedbackText) {
            await roleplaySessionService.saveFeedback(sessionId, feedbackText);
          }
        } else {
          const errorData = await feedbackRes.json();
          setError(errorData.error || 'Failed to generate feedback');
        }
      } catch (feedbackError) {
        console.error('Feedback generation error:', feedbackError);
        setError('Unable to generate feedback. Network error.');
      }

      // Call the existing finish webhook
      try {
        const res = await fetch('/api/roleplay/finish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages }),
        });

        const text = await res.text();
        setSummary(text);
      } catch (summaryError) {
        console.error('Summary generation error:', summaryError);
        // Don't set error for summary failure - feedback is more important
      }
      
      // Only navigate if no errors occurred
      if (!error && feedback) {
        setTimeout(() => {
          router.push('/roleplay');
        }, 5000);
      }
      
    } catch (error) {
      console.error('Error finishing roleplay session:', error);
      setError('Error saving session. Please try again.');
    } finally {
      setFinishing(false);
    }
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex flex-col h-[calc(100vh-8rem)] bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h2 className="font-medium text-gray-800">{scenario.name}</h2>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  type="button"
                  className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Show roleplay guide"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-sm">
                <p className="text-sm whitespace-pre-wrap">{scenario.guide || "No guide available"}</p>
              </TooltipContent>
            </Tooltip>
          </div>
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

      {/* Results section */}
      {(feedback || summary || error) && (
        <div className="border-t bg-gray-50">
          {error && (
            <div className="p-3 bg-red-50 text-sm text-red-700 border-b border-red-200">
              <strong>Error:</strong> {error}
            </div>
          )}
          {feedback && (
            <div className="p-4 text-sm">
              <h3 className="font-medium text-gray-800 mb-2">Assessment Feedback:</h3>
              <div className="text-gray-700 whitespace-pre-wrap">{feedback}</div>
            </div>
          )}
          {summary && (
            <div className="p-3 bg-blue-50 text-sm text-blue-700 border-t border-blue-200">
              {summary}
            </div>
          )}
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
    </TooltipProvider>
  );
}