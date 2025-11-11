'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/auth/use-auth';
import { JournalFeedback } from '@/types/journal';
import { Button } from '@/components/ui/button';
import { BreathingLoader } from '@/components/ui/breathing-loader';
import { HighlightSelector } from '@/components/journal/highlight-selector-new';
import { HighlightList } from '@/components/features/journal/editor/highlight-list';
import styles from '@/components/features/journal/editor/highlight-selector.module.css';

// --------------------------
// ✅ Custom Hooks
// --------------------------

function useJournalFeedback() {
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const [feedback, setFeedback] = useState<JournalFeedback | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const param = searchParams?.get('feedback');
      if (!param) throw new Error('No feedback data found.');
      const parsed = JSON.parse(decodeURIComponent(param));
      setFeedback(parsed);
    } catch (err) {
      setError('Failed to load feedback data.');
    }
  }, [searchParams]);

  return { feedback, error, user, loading };
}

function useHighlights() {
  const [highlights, setHighlights] = useState<string[]>([]);

  const addHighlight = useCallback((text: string) => {
    setHighlights(prev => (prev.includes(text) ? prev : [...prev, text]));
  }, []);

  const removeHighlight = useCallback((index: number) => {
    const text = highlights[index];
    setHighlights(prev => prev.filter((_, i) => i !== index));

    const container = document.getElementById('improved-version-content');
    if (!container) return;

    const highlightEls = container.querySelectorAll(`.${styles['highlighted-text']}`);
    highlightEls.forEach(el => {
      if (el.textContent === text) {
        el.replaceWith(document.createTextNode(text));
      }
    });
  }, [highlights]);

  return { highlights, addHighlight, removeHighlight };
}

// --------------------------
// ✅ Helper: Save + Send to n8n webhook
// --------------------------

async function saveJournalAndHighlights({
  userId,
  feedback,
  highlights,
}: {
  userId: string;
  feedback: JournalFeedback;
  highlights: string[];
}) {
  const payload = {
    userId,
    title: feedback.title || '',
    content: feedback.improvedVersion || feedback.originalVersion || '',
    journalDate: new Date().toISOString().split('T')[0],
    highlights,
  };

  const webhookUrl =
    process.env.NEXT_PUBLIC_SAVE_HIGHLIGHTS_WEBHOOK_URL ||
    'https://n8n.elyandas.com/webhook/save-process-highlight';

  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error('Webhook request failed');
  return res.json();
}

// --------------------------
// ✅ Main Component
// --------------------------

export default function JournalFeedbackPage() {
  const router = useRouter();
  const { feedback, error, user, loading } = useJournalFeedback();
  const { highlights, addHighlight, removeHighlight } = useHighlights();
  const [processing, setProcessing] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push('/auth');
  }, [loading, user, router]);

  const handleSave = async (redirectToFlashcards: boolean) => {
    if (!user?.id || !feedback) return;
    setProcessing(true);
    setErrMsg(null);
    try {
      const data = await saveJournalAndHighlights({
        userId: user.id,
        feedback,
        highlights,
      });

      if (redirectToFlashcards && highlights.length) {
        localStorage.setItem('flashcardData', JSON.stringify(data));
        router.push('/flashcards/create');
      } else {
        router.push('/journal');
      }
    } catch (err) {
      setErrMsg((err as Error).message || 'Failed to save journal');
    } finally {
      setProcessing(false);
    }
  };

  if (loading || processing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <BreathingLoader
          message={processing ? 'Processing your highlights' : 'Preparing your feedback'}
        />
      </div>
    );
  }

  if (error || !feedback) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-2">Feedback Not Available</h2>
            <p className="text-gray-600 mb-8">{error}</p>
            <Button onClick={() => router.back()}>Go Back</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Journal Feedback
          </h1>

          <Section title="Title Suggestion">{feedback.title}</Section>
          <Section title="Summary">{feedback.summary}</Section>
          <Section title="Original Version">{feedback.originalVersion}</Section>

          <Section title="Improved Version">
            <div id="improved-version-content" className="whitespace-pre-wrap">
              {feedback.improvedVersion}
            </div>
            <HighlightSelector
              containerId="improved-version-content"
              onHighlightSaved={addHighlight}
              highlights={highlights}
            />
          </Section>

          <Section title="Saved Highlights">
            <HighlightList highlights={highlights} onRemove={removeHighlight} />
          </Section>

          {errMsg && <p className="text-red-500 mt-4">{errMsg}</p>}

          <div className="flex justify-end gap-4 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                localStorage.setItem('editJournalContent', feedback.originalVersion || '');
                localStorage.setItem('editJournalTitle', feedback.title || '');
                router.push('/journal/new?edit=true');
              }}
            >
              Sửa
            </Button>

            <Button
              onClick={() => handleSave(highlights.length > 0)}
              disabled={processing}
            >
              {processing
                ? 'Processing...'
                : highlights.length > 0
                ? 'Lưu nhật ký và Tạo Flashcards'
                : 'Lưu'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --------------------------
// ✅ Small Reusable UI Section
// --------------------------

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-gray-700 mb-3">{title}</h2>
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">{children}</div>
    </div>
  );
}
