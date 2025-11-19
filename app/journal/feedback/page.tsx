'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/auth/use-auth';
import { journalService } from '@/services/journal-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BreathingLoader } from '@/components/ui/breathing-loader';
import { LoadingState, ErrorState } from '@/components/ui/common/state-components';
import { HighlightSelector } from '@/components/journal/highlight-selector-new';
import { HighlightList } from '@/components/features/journal/editor/highlight-list';
import { feedbackLogsService } from '@/services/supabase/feedback-logs-service';
import styles from '@/components/features/journal/editor/highlight-selector.module.css';

// Custom hooks
function useJournalFeedback() {
  const searchParams = useSearchParams();
  const [feedback, setFeedback] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const param = searchParams?.get('feedback');
      if (!param) throw new Error('No feedback data found.');
      const parsed = JSON.parse(decodeURIComponent(param));
      setFeedback(Array.isArray(parsed) ? parsed[0] : parsed);
    } catch (err) {
      setError('Failed to load feedback data.');
    }
  }, [searchParams]);

  return { feedback, error };
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

// Save function
async function saveJournalAndHighlights({
  userId, feedback, highlights, title
}: {
  userId: string; feedback: any; highlights: string[]; title: string;
}) {
  try {
    // Extract original and enhanced content from feedback
    const originalContent = feedback.originalVersion || feedback.fixed_typo || '';
    const enhancedContent = feedback.enhanced_version || feedback.improvedVersion || '';
    
    // Use journal service to save both original and enhanced versions
    const result = await journalService.createJournalFromFeedback(userId, {
      title,
      originalContent,
      enhancedContent,
      journalDate: new Date().toISOString(),
      highlights,
    });
    
    // Save feedback details if available
    if (feedback.fb_details?.length > 0) {
      try {
        await feedbackLogsService.saveFeedbackLogs(userId, feedback.fb_details);
      } catch (error) {
        console.error('Failed to save feedback logs:', error);
        // Continue even if feedback logs fail
      }
    }
    
    // Generate flashcards if highlights exist
    let flashcardData = null;
    if (highlights && highlights.length > 0) {
      try {
        const flashcardResponse = await fetch('/api/flashcards/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            highlights,
            content: enhancedContent || originalContent,
            title,
          }),
        });
        
        if (flashcardResponse.ok) {
          const flashcardResult = await flashcardResponse.json();
          flashcardData = flashcardResult.data?.flashcards || flashcardResult.flashcards || [];
          console.log('Generated flashcards:', flashcardData);
        } else {
          console.error('Failed to generate flashcards:', flashcardResponse.statusText);
        }
      } catch (error) {
        console.error('Error generating flashcards:', error);
        // Continue without flashcards if generation fails
      }
    }
    
    return { 
      id: result.id, 
      success: true,
      flashcards: flashcardData 
    };
  } catch (error) {
    console.error('Error saving journal from feedback:', error);
    throw error;
  }
}

export default function JournalFeedbackPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { feedback, error } = useJournalFeedback();
  const { highlights, addHighlight, removeHighlight } = useHighlights();
  const [processing, setProcessing] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [editableTitle, setEditableTitle] = useState<string>('');

  useEffect(() => {
    if (!loading && !user) router.push('/auth');
    if (feedback) setEditableTitle(feedback.title || '');
  }, [loading, user, router, feedback]);

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

      if (redirectToFlashcards && highlights.length && data.flashcards) {
        // Store generated flashcards for the creation page
        localStorage.setItem('flashcardData', JSON.stringify({
          output: data.flashcards
        }));
        router.push('/flashcards/create');
      } else if (redirectToFlashcards && highlights.length) {
        // Fallback: redirect with journal data if flashcard generation failed
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

  const handleEdit = () => {
    localStorage.setItem('editJournalContent', feedback.fixed_typo || feedback.originalVersion || '');
    localStorage.setItem('editJournalTitle', editableTitle || '');
    router.push('/journal/new?edit=true');
  };

  if (loading || processing) {
    return (
      <div className="flex-1 flex flex-col" style={{ transition: '0.3s ease-in-out', width: '100%' }}>
        <div className="w-full max-w-3xl mx-auto px-4 py-10">
          <Card className="bg-white rounded-lg shadow-sm p-6 border-0">
            <CardContent>
              <BreathingLoader 
                message={processing ? 
                  (highlights.length > 0 ? 'Creating flashcards from your highlights...' : 'Processing your highlights...') : 
                  'Preparing your feedback...'
                }
                className="py-8"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !feedback) {
    return (
      <div className="flex-1 flex flex-col" style={{ transition: '0.3s ease-in-out', width: '100%' }}>
        <div className="w-full max-w-3xl mx-auto px-4 py-10">
          <Card className="bg-white rounded-lg shadow-sm p-6 border-0">
            <CardContent>
              <ErrorState message={error || 'Feedback not found'} onRetry={() => router.back()} />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col" style={{ transition: '0.3s ease-in-out', width: '100%' }}>
      <div className="w-full max-w-3xl mx-auto px-4 py-10">
        <Card className="bg-white rounded-lg shadow-sm p-6 border-0">
          <CardContent className="space-y-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Phiên bản xịn xò</h1>

            </div>
            
            {/* Title Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <Input
                value={editableTitle}
                onChange={(e) => setEditableTitle(e.target.value)}
                placeholder="Enter journal title..."
                className="text-lg"
              />
            </div>

            {/* Summary */}
            <ContentSection title="Summary" content={feedback.summary} />

            {/* Version Comparison */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Version Comparison</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                <VersionCard
                  title="Fixed Typo"
                  content={feedback.fixed_typo || feedback.originalVersion}
                  className="border-orange-200 bg-orange-50"
                  dotColor="bg-orange-500"
                />
                
                <VersionCard
                  title="Enhanced Version"
                  content={feedback.enhanced_version || feedback.improvedVersion}
                  className="border-green-200 bg-green-50"
                  dotColor="bg-green-500"
                  id="improved-version-content"
                >
                  <HighlightSelector
                    containerId="improved-version-content"
                    onHighlightSaved={addHighlight}
                    highlights={highlights}
                  />
                </VersionCard>
              </div>
            </div>

            {/* Feedback Details */}
            {feedback.fb_details?.length > 0 && (
              <FeedbackDetailsSection details={feedback.fb_details} />
            )}

            {/* Legacy Vocab Suggestions */}
            {feedback.vocabSuggestions?.length > 0 && (
              <VocabSuggestionsSection suggestions={feedback.vocabSuggestions} />
            )}

            {/* Highlights */}
            <ContentSection title="Saved Highlights">
              <HighlightList highlights={highlights} onRemove={removeHighlight} />
            </ContentSection>

            {errMsg && <p className="text-red-500">{errMsg}</p>}

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-4">
              <Button variant="outline" onClick={handleEdit}>
                Sửa
              </Button>
              <Button onClick={() => handleSave(highlights.length > 0)} disabled={processing}>
                {processing ? 'Processing...' : 
                 highlights.length > 0 ? 'Lưu nhật ký và Tạo Flashcards' : 'Lưu'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Reusable Components
function ContentSection({ title, content, children }: { 
  title: string; 
  content?: string; 
  children?: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-700 mb-3">{title}</h3>
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        {content && <div className="whitespace-pre-wrap text-gray-800">{content}</div>}
        {children}
      </div>
    </div>
  );
}

function VersionCard({ 
  title, content, className, dotColor, id, children 
}: {
  title: string; content: string; className: string; dotColor: string; id?: string; children?: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 ${dotColor} rounded-full`}></div>
        <h4 className="text-md font-medium text-gray-800">{title}</h4>
      </div>
        <div id={id} className="whitespace-pre-wrap text-gray-800 leading-relaxed">
          {content}
        </div>
        {children}
      </div>

  );
}

function FeedbackDetailsSection({ details }: { details: any[] }) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Chi tiết phản hồi</h3>
      <div className="space-y-4">
        {details.map((detail: any, index: number) => (
          <Card key={index} className="hover:shadow-md transition-shadow border-0 bg-white">
            <CardContent className="p-4">
              <div className="text-sm font-medium text-blue-600 mb-2">
                {(detail.type || detail.type_of_fix)?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
              </div>
              <div className="text-gray-800">
                {detail.fix || `"${detail.improved_part}"`}
              </div>
              {detail.explanation && (
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded mt-2">
                  <strong>Giải thích:</strong> {detail.explanation}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function VocabSuggestionsSection({ suggestions }: { suggestions: any[] }) {
  return (
    <ContentSection title="Vocabulary Suggestions">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {suggestions.map((vocab: any, index: number) => (
          <Card key={index}>
            <CardContent className="p-3">
              <div className="font-semibold text-blue-600">{vocab.word}</div>
              <div className="text-sm text-gray-700 mt-1">{vocab.meaning}</div>
              {vocab.example && (
                <div className="text-xs text-gray-500 mt-2 italic">
                  Example: {vocab.example}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </ContentSection>
  );
}
