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
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem('roleplayMessages');
    if (saved) setMessages(JSON.parse(saved));
  }, []);

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
        let parsed = text;

        try {
          const json = JSON.parse(text);
          parsed = json.output || JSON.stringify(json, null, 2);
        } catch {
          // keep as plain text
        }

        setFeedback(parsed.trim());
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

      const highlightEls = container.querySelectorAll(`.${styles['highlighted-text']}`);
      highlightEls.forEach((el) => {
        if (el.textContent === text) el.replaceWith(document.createTextNode(text));
      });
    },
    [highlights]
  );

  const handleSaveFeedback = async () => {
    if (!feedback || highlights.length === 0) return;
    setSaving(true);

    try {
      const res = await fetch(
        process.env.NEXT_PUBLIC_SAVE_ROLEPLAY_FEEDBACK_WEBHOOK_URL ||
          'https://auto.zephyrastyle.com/webhook/save-process-highlight',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            feedback,
            highlights,
            createdAt: new Date().toISOString(),
          }),
        }
      );

      if (!res.ok) throw new Error('Save failed');
      alert('✅ Feedback saved successfully!');
      router.push('/roleplay');
    } catch (err) {
      console.error('Error saving feedback:', err);
      alert('❌ Không thể lưu phản hồi.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-white text-foreground"
      style={{ fontFamily: 'var(--font-sans)' }}
    >
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b bg-card">
        <h1 className="text-lg font-semibold">Tổng kết hội thoại</h1>
      </header>

      {/* Main content */}
      <main className="flex-1 grid grid-rows-2 divide-y divide-border">
        {/* 🗨️ Conversation */}
        <section className="overflow-y-auto p-6 bg-gray-50">
          <h2 className="text-base font-medium mb-4">Cuộc hội thoại</h2>
          <div className="space-y-3">
            {messages.length > 0 ? (
              messages.map((m) => (
                <MessageBubble
                  key={m.id}
                  message={m}
                  roleName={m.sender === 'bot' ? 'AI Partner' : 'You'}
                />
              ))
            ) : (
              <p className="text-sm text-gray-500 italic">Không có dữ liệu hội thoại.</p>
            )}
          </div>
        </section>

        {/* 💬 Feedback + Highlight */}
        <section className="overflow-y-auto p-6 bg-white">
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
                  <h3 className="text-sm font-semibold mb-2">Đoạn văn được đánh dấu</h3>
                  <HighlightList highlights={highlights} onRemove={removeHighlight} />
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-500">Không có phản hồi.</p>
          )}
        </section>
      </main>

      {/* Footer Actions */}
      <footer className="flex items-center justify-end gap-6 px-6 py-4 border-t bg-gray-50">
        <button
          onClick={() => router.push('/roleplay')}
          className="text-gray-500 hover:text-gray-800 text-sm font-medium"
        >
          Hủy
        </button>
        <Button
          onClick={handleSaveFeedback}
          disabled={!feedback || highlights.length === 0 || saving}
          className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-6"
        >
          {saving ? 'Đang lưu...' : 'Lưu phản hồi'}
        </Button>
      </footer>
    </div>
  );
}
