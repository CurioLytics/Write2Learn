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
  const [feedback, setFeedback] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editableTitle, setEditableTitle] = useState<string>('');

  useEffect(() => {
    try {
      const param = searchParams?.get('feedback');
      if (!param) throw new Error('No feedback data found.');
      const parsed = JSON.parse(decodeURIComponent(param));
      // Handle both old and new webhook response formats
      const feedbackData = Array.isArray(parsed) ? parsed[0] : parsed;
      setFeedback(feedbackData);
      setEditableTitle(feedbackData.title || '');
    } catch (err) {
      setError('Failed to load feedback data.');
    }
  }, [searchParams]);

  return { feedback, error, user, loading, editableTitle, setEditableTitle };
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
  title,
}: {
  userId: string;
  feedback: any;
  highlights: string[];
  title: string;
}) {
  const payload = {
    userId,
    title,
    content: feedback.enhanced_version || feedback.improvedVersion || feedback.fixed_typo || feedback.originalVersion || '',
    journalDate: new Date().toISOString().split('T')[0],
    highlights,
  };

  const webhookUrl =
    process.env.NEXT_PUBLIC_SAVE_HIGHLIGHTS_WEBHOOK_URL ||
    'https://automain.elyandas.com/webhook/save-process-highlight-v1';

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
  const { feedback, error, user, loading, editableTitle, setEditableTitle } = useJournalFeedback();
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
        title: editableTitle,
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
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Journal Feedback
          </h1>

          {/* Editable Title Section */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Title</h2>
            <input
              type="text"
              value={editableTitle}
              onChange={(e) => setEditableTitle(e.target.value)}
              className="w-full p-3 bg-white border-2 border-gray-200 rounded-lg text-gray-800 font-medium text-lg focus:border-blue-400 focus:outline-none"
              placeholder="Enter journal title..."
            />
          </div>

          <Section title="Summary">{feedback.summary}</Section>

          {/* Side-by-side comparison section */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Version Comparison</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Fixed Typo Version - Left Side */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <h3 className="text-md font-medium text-gray-800">Fixed Typo</h3>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg border-2 border-orange-200 min-h-[300px] relative">
                  <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                    {feedback.fixed_typo || feedback.originalVersion}
                  </div>
                </div>
              </div>

              {/* Enhanced Version - Right Side */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <h3 className="text-md font-medium text-gray-800">Enhanced Version</h3>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200 min-h-[300px] relative">
                  <div id="improved-version-content" className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                    {feedback.enhanced_version || feedback.improvedVersion}
                  </div>
                  <HighlightSelector
                    containerId="improved-version-content"
                    onHighlightSaved={addHighlight}
                    highlights={highlights}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Feedback Details Section */}
          {feedback.fb_details && feedback.fb_details.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Feedback Details</h2>
              <div className="space-y-4">
                {feedback.fb_details.map((detail: any, index: number) => (
                  <div key={index} className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-blue-600 mb-1">
                          {detail.type_of_fix?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                        </div>
                        <div className="text-gray-800 font-medium">
                          "{detail.improved_part}"
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded mt-2">
                      <strong>Explanation:</strong> {detail.explanation}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Legacy Vocabulary Suggestions */}
          {feedback.vocabSuggestions && feedback.vocabSuggestions.length > 0 && (
            <Section title="Vocabulary Suggestions">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {feedback.vocabSuggestions.map((vocab: any, index: number) => (
                  <div key={index} className="p-3 bg-white border border-gray-300 rounded-lg">
                    <div className="font-semibold text-blue-600">{vocab.word}</div>
                    <div className="text-sm text-gray-700 mt-1">{vocab.meaning}</div>
                    {vocab.example && (
                      <div className="text-xs text-gray-500 mt-2 italic">
                        Example: {vocab.example}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}

          <Section title="Saved Highlights">
            <HighlightList highlights={highlights} onRemove={removeHighlight} />
          </Section>

          {errMsg && <p className="text-red-500 mt-4">{errMsg}</p>}

          <div className="flex justify-end gap-4 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                localStorage.setItem('editJournalContent', feedback.fixed_typo || feedback.originalVersion || '');
                localStorage.setItem('editJournalTitle', editableTitle || '');
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
