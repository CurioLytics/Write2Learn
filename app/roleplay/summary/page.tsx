'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { MessageBubble } from '@/components/roleplay/message-bubble';
import { HighlightSelector } from '@/components/journal/highlight-selector-new';
import { HighlightList } from '@/components/features/journal/editor/highlight-list';
import styles from '@/components/features/journal/editor/highlight-selector.module.css';
import type { RoleplayMessage } from '@/types/roleplay';

export default function RoleplaySummaryPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<RoleplayMessage[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [highlights, setHighlights] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);

  // 🟢 Load conversation
  useEffect(() => {
    const saved = sessionStorage.getItem('roleplayMessages');
    if (saved) setMessages(JSON.parse(saved));
  }, []);

  // 🟢 Fetch AI feedback summary
  useEffect(() => {
    if (messages.length === 0) return;

    const fetchFeedback = async () => {
      setLoading(true);
      try {
        const res = await fetch('https://n8n.elyandas.com/webhook/finish-roleplay', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages }),
        });

        const text = await res.text();
        try {
          const json = JSON.parse(text);
          setFeedback((json.output || JSON.stringify(json, null, 2)).trim());
        } catch {
          setFeedback(text.trim());
        }
      } catch (err) {
        console.error('Error fetching feedback:', err);
        setFeedback('⚠️ Không thể lấy phản hồi. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [messages]);

  // 🟢 Highlight management
  const addHighlight = useCallback((text: string) => {
    setHighlights((prev) => (prev.includes(text) ? prev : [...prev, text]));
  }, []);

  const removeHighlight = useCallback(
    (index: number) => {
      const text = highlights[index];
      setHighlights((prev) => prev.filter((_, i) => i !== index));
      const container = document.getElementById('feedback-content');
      if (!container) return;
      container
        .querySelectorAll(`.${styles['highlighted-text']}`)
        .forEach((el) => {
          if (el.textContent === text) el.replaceWith(document.createTextNode(text));
        });
    },
    [highlights]
  );

  // 🟢 Save and navigate to flashcard creation
  const handleSaveHighlights = async () => {
    if (!feedback) return;
    setProcessing(true);

    try {
      const payload = {
        type: 'roleplay',
        feedback,
        highlights,
        createdAt: new Date().toISOString(),
      };

      const webhookUrl =
        process.env.NEXT_PUBLIC_SAVE_HIGHLIGHTS_WEBHOOK_URL ||
        'https://n8n.elyandas.com/webhook/role-play-flashcard';

      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Webhook failed');

      const data = await res.json();

      // ✅ Store processed flashcards
      localStorage.setItem('flashcardData', JSON.stringify(data));

      // ✅ Redirect to flashcard creation
      router.push('/flashcards/create');
    } catch (err) {
      console.error('Error processing highlights:', err);
      alert('❌ Không thể xử lý từ vựng.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 sm:px-6"> 
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Tổng kết hội thoại</h1>
      </header>

      {/* Card Container */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {/* Conversation */}
        <section className="p-6 border-b bg-gray-50">
          <h2 className="text-base font-medium mb-4">Cuộc hội thoại</h2>
          {messages.length > 0 ? (
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
              {messages.map((m) => (
                <MessageBubble
                  key={m.id}
                  message={m}
                  roleName={m.sender === 'bot' ? 'AI Partner' : 'You'}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">Không có dữ liệu hội thoại.</p>
          )}
        </section>

        {/* Feedback */}
        <section className="p-6">
          <h2 className="text-base font-medium mb-4">Phản hồi & Gợi ý</h2>
          {loading ? (
            <p className="text-sm text-gray-500">Đang phân tích...</p>
          ) : feedback ? (
            <>
              <div
                id="feedback-content"
                className="bg-gray-50 border rounded-xl p-4 text-sm text-gray-800 whitespace-pre-wrap leading-relaxed"
              >
                {feedback}
              </div>

              <div className="mt-4">
                <HighlightSelector
                  containerId="feedback-content"
                  onHighlightSaved={addHighlight}
                  highlights={highlights}
                />
              </div>

              {highlights.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold mb-2">Từ hoặc cụm được đánh dấu</h3>
                  <HighlightList highlights={highlights} onRemove={removeHighlight} />
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-500">Không có phản hồi.</p>
          )}
        </section>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-4 mt-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/journal')}
          className="text-gray-500 hover:text-gray-800 text-sm font-medium"
        >
          Hủy
        </Button>

        <Button
          onClick={() => {
            if (highlights.length > 0) {
              handleSaveHighlights();
            } else {
              // 🎯 ĐÃ CHỈNH SỬA: Chuyển hướng đến /roleplay thay vì /journal khi nhấn "Kết thúc"
              router.push('/roleplay'); 
            }
          }}
          disabled={processing}
          className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-6"
        >
          {processing
            ? 'Đang lưu...'
            : highlights.length > 0
            ? 'Lưu từ vựng'
            : 'Kết thúc'}
        </Button>
      </div>
    </div>
  );
}