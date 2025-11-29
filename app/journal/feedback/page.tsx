'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/auth/use-auth';
import { journalService } from '@/services/journal-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BreathingLoader } from '@/components/ui/breathing-loader';
import { ErrorState } from '@/components/ui/common/state-components';
import { HighlightSelector } from '@/components/features/journal/editor/highlight-selector';
import { HighlightList } from '@/components/features/journal/editor/highlight-list';
import { feedbackLogsService } from '@/services/supabase/feedback-logs-service';
import { flashcardGenerationService } from '@/services/flashcard-generation-service';
import { GrammarDetail } from '@/types/journal-feedback';

// Custom hooks
function useJournalFeedbackDB(userId?: string) {
  const searchParams = useSearchParams();
  const [feedback, setFeedback] = useState<any | null>(null);
  const [journalId, setJournalId] = useState<string | null>(null);
  const [feedbackId, setFeedbackId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const jId = searchParams?.get('journalId');
        const fId = searchParams?.get('feedbackId');
        const isProcessing = searchParams?.get('processing') === 'true';

        setJournalId(jId);
        setFeedbackId(fId);

        let fb: any | null = null;

        // If processing flag is set, make the API call
        if (isProcessing && jId) {
          console.log('🔄 Processing feedback for journal:', jId);

          // Fetch journal content
          const journal = await journalService.getJournalById(jId);

          // Import the feedback service
          const { journalFeedbackService } = await import('@/services/journal-feedback-service');
          const { feedbackLogsService } = await import('@/services/supabase/feedback-logs-service');

          // Make API call
          const result = await journalFeedbackService.getFeedback(journal.content, journal.title || '');

          if (result.success && result.data) {
            // Update journal with summary
            await journalService.updateJournal(jId, {
              summary: result.data.summary,
              is_draft: true,
            });

            // Get authenticated user ID from parameter
            const userIdForFeedback = userId;

            if (!userIdForFeedback) {
              throw new Error('User ID not available - please log in');
            }

            // Save feedback to database
            const newFeedbackId = await feedbackLogsService.saveFeedback({
              userId: userIdForFeedback,
              sourceId: jId,
              sourceType: 'journal',
              feedbackData: {
                title: journal.title,
                clarity: result.data.output?.clarity,
                vocabulary: result.data.output?.vocabulary,
                ideas: result.data.output?.ideas,
                enhanced_version: result.data.enhanced_version || result.data.improvedVersion,
                fixed_typo: result.data.fixed_typo || journal.content,
              },
              grammarDetails: result.data.grammar_details || [],
            });

            // Set feedback data
            fb = {
              title: journal.title,
              summary: result.data.summary,
              output: result.data.output,
              enhanced_version: result.data.enhanced_version || result.data.improvedVersion,
              fixed_typo: result.data.fixed_typo || journal.content,
              grammar_details: result.data.grammar_details,
            };

            setFeedbackId(newFeedbackId);
            console.log('✅ Feedback processed and saved:', newFeedbackId);
          } else {
            throw new Error(result.error?.message || 'Failed to get feedback');
          }
        } else if (fId) {
          // Load existing feedback by ID
          fb = await feedbackLogsService.getById(fId);
        } else if (jId) {
          // Load latest feedback for journal
          const latest = await feedbackLogsService.getLatestBySource(jId, 'journal');
          fb = latest.feedback;
          if (latest.feedbackId) setFeedbackId(latest.feedbackId);
        }

        // Fetch journal data to get summary if not already loaded
        if (jId && fb && !fb.summary) {
          const journal = await journalService.getJournalById(jId);
          fb.summary = journal.summary || '';
        }

        if (!cancelled) {
          if (!fb) {
            setError('Không tìm thấy phản hồi');
          }
          setFeedback(fb);
        }
      } catch (err) {
        console.error('Error loading feedback:', err);
        if (!cancelled) setError((err as Error).message || 'Failed to load feedback data.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [searchParams]);

  return { feedback, journalId, feedbackId, error, loading };
}

function useHighlights() {
  const [highlights, setHighlights] = useState<string[]>([]);

  const addHighlight = useCallback((text: string) => {
    setHighlights(prev => (prev.includes(text) ? prev : [...prev, text]));
  }, []);

  const removeHighlight = useCallback((index: number) => {
    setHighlights(prev => prev.filter((_, i) => i !== index));
  }, []);

  return { highlights, addHighlight, removeHighlight };
}

// Removed legacy saveJournalAndHighlights helper (unused) to avoid dead code.

export default function JournalFeedbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const { feedback, journalId, feedbackId, error, loading: loadingFB } = useJournalFeedbackDB(user?.id);
  const { highlights, addHighlight, removeHighlight } = useHighlights();
  const [processing, setProcessing] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [editableTitle, setEditableTitle] = useState<string>('');

  useEffect(() => {
    // Only redirect if auth is done loading and there's no user
    if (!loading && !user) {
      router.push('/auth');
      return;
    }

    // Set title when feedback loads
    if (feedback) {
      setEditableTitle(feedback.title || '');
    }
  }, [loading, user, router, feedback]);

  // No sessionStorage dependency in DB-backed flow

  const handleSave = async (redirectToFlashcards: boolean) => {
    if (!user?.id || !feedback) return;
    setProcessing(true);
    setErrMsg(null);

    try {
      const originalContent = feedback.fixed_typo || feedback.originalVersion || '';
      const enhancedContent = feedback.enhanced_version || feedback.improvedVersion || '';
      let resultId: string;

      if (journalId) {
        // Publish draft and update content
        await journalService.publishDraft(journalId, {
          title: editableTitle,
          content: enhancedContent || originalContent,
          enhanced_version: enhancedContent,
        });
        resultId = journalId;
      } else {
        // Create new entry if we didn't have a draft id
        const result = await journalService.createJournalFromFeedback(user.id, {
          title: editableTitle,
          originalContent,
          enhancedContent,
          journalDate: new Date().toISOString(),
          highlights,
        });
        resultId = result.id;
      }

      // Flashcards
      if (redirectToFlashcards && highlights.length) {
        try {
          const result = await flashcardGenerationService.generateFromJournal(
            { id: user.id, name: 'User', english_level: 'intermediate', style: 'conversational' },
            editableTitle,
            enhancedContent || originalContent,
            highlights
          );
          localStorage.setItem('flashcardData', JSON.stringify(result.flashcards));
        } catch (e) {
          console.error('Error generating flashcards:', e);
        }
        // Use replace to prevent going back to feedback after save
        router.replace('/flashcards/generate');
      } else {
        // Use replace to prevent going back to feedback after save
        router.replace('/journal');
      }
    } catch (err) {
      setErrMsg((err as Error).message || 'Failed to save journal');
    } finally {
      setProcessing(false);
    }
  };

  const handleEdit = () => {
    // 1) Prefer journalId from URL (robust across reloads)
    const paramId = searchParams?.get('journalId');
    if (paramId) {
      router.push(`/journal/${paramId}`);
      return;
    }

    // 2) Fallback to draft stored in sessionStorage
    const draftJson = sessionStorage.getItem('journalDraft');
    if (draftJson) {
      try {
        const draft = JSON.parse(draftJson);
        if (draft.journalId) {
          router.push(`/journal/${draft.journalId}`);
          return;
        }
      } catch (e) {
        console.error('Failed to parse journal draft:', e);
      }
    }

    // 3) No ID available, go to new editor
    router.push('/journal/new');
  };

  // Show loading only when feedback is loading or processing
  // Use same full-screen layout as editor for smooth transition
  if (loadingFB || processing) {
    return (
      <div className="bg-white px-6 py-8 min-h-screen flex items-center justify-center">
        <BreathingLoader
          message={processing ?
            (highlights.length > 0 ? 'Đang tạo flashcard từ phần đánh dấu...' : 'Đang xử lý...') :
            'Đang phân tích nhật ký của bạn...'
          }
          className="max-w-md"
        />
      </div>
    );
  }

  // Auth check - redirect if not authenticated (but don't show loading)
  if (!loading && !user) {
    return null; // Will redirect via useEffect
  }

  if (error || !feedback) {
    return (
      <div className="w-full max-w-3xl mx-auto px-4 py-10">
        <Card className="bg-white rounded-lg shadow-sm p-6 border-0">
          <CardContent>
            <ErrorState message={error || 'Không tìm thấy phản hồi'} onRetry={() => router.back()} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-10">
      <Card className="bg-white rounded-lg shadow-sm p-6 border-0">
        <CardContent className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Xem học được gì nào ^^</h1>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu đề</label>
            <Input
              value={editableTitle}
              onChange={(e) => setEditableTitle(e.target.value)}
              placeholder="Nhập tiêu đề nhật ký..."
              className="text-lg"
            />
          </div>

          {/* Summary */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Tóm tắt</h3>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="whitespace-pre-wrap text-blue-600">{feedback.summary || 'Không có tóm tắt'}</div>
            </div>
          </div>

          {/* Fixed Typo Accordion */}
          <Accordion type="single" collapsible>
            <AccordionItem value="fixed-typo">
              <AccordionTrigger>Phiên bản đã sửa lỗi chính tả</AccordionTrigger>
              <AccordionContent>
                <div className="whitespace-pre-wrap text-blue-600 leading-relaxed p-4 bg-blue-50 rounded-lg">
                  {feedback.fixed_typo || feedback.originalVersion || 'Không có nội dung'}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Feedback Tabs */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Phản hồi</h3>
            <Tabs defaultValue="clarity" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="clarity">Độ rõ ràng</TabsTrigger>
                <TabsTrigger value="vocabulary">Từ vựng</TabsTrigger>
                <TabsTrigger value="ideas">Ý tưởng</TabsTrigger>
                <TabsTrigger value="enhanced">Bản final</TabsTrigger>
              </TabsList>

              <TabsContent value="clarity" className="mt-4">
                <div id="clarity-content" className="whitespace-pre-wrap text-blue-600 leading-relaxed p-4 bg-blue-50 rounded-lg min-h-[200px]">
                  {feedback.output?.clarity || 'Không có nội dung'}
                </div>
                <HighlightSelector
                  containerId="clarity-content"
                  onHighlightSaved={addHighlight}
                  highlights={highlights}
                />
              </TabsContent>

              <TabsContent value="vocabulary" className="mt-4">
                <div id="vocabulary-content" className="whitespace-pre-wrap text-blue-600 leading-relaxed p-4 bg-blue-50 rounded-lg min-h-[200px]">
                  {feedback.output?.vocabulary || 'Không có nội dung'}
                </div>
                <HighlightSelector
                  containerId="vocabulary-content"
                  onHighlightSaved={addHighlight}
                  highlights={highlights}
                />
              </TabsContent>

              <TabsContent value="ideas" className="mt-4">
                <div id="ideas-content" className="whitespace-pre-wrap text-blue-600 leading-relaxed p-4 bg-blue-50 rounded-lg min-h-[200px]">
                  {feedback.output?.ideas || 'Không có nội dung'}
                </div>
                <HighlightSelector
                  containerId="ideas-content"
                  onHighlightSaved={addHighlight}
                  highlights={highlights}
                />
              </TabsContent>

              <TabsContent value="enhanced" className="mt-4">
                <div id="enhanced-content" className="whitespace-pre-wrap text-blue-600 leading-relaxed p-4 bg-blue-50 rounded-lg min-h-[200px]">
                  {feedback.enhanced_version || feedback.improvedVersion || 'Không có nội dung'}
                </div>
                <HighlightSelector
                  containerId="enhanced-content"
                  onHighlightSaved={addHighlight}
                  highlights={highlights}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Grammar Details */}
          {feedback.grammar_details?.length > 0 && (
            <GrammarDetailsSection details={feedback.grammar_details} />
          )}

          {/* Highlights */}
          <div>
            <h3 className="text-base font-semibold text-gray-800 mb-3">Đã đánh dấu</h3>
            <HighlightList highlights={highlights} onRemove={removeHighlight} />
          </div>

          {errMsg && <p className="text-red-500">{errMsg}</p>}

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-4">
            <Button variant="outline" onClick={handleEdit}>
              Sửa
            </Button>
            <Button onClick={() => handleSave(highlights.length > 0)} disabled={processing}>
              {highlights.length > 0 ? 'Lưu & Tạo Flashcard' : 'Lưu'}
            </Button>

          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function GrammarDetailsSection({ details }: { details: GrammarDetail[] }) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Chi tiết ngữ pháp</h3>
      <div className="space-y-4">
        {details.map((detail, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow border-0 bg-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-sm font-medium text-blue-600">
                  {detail.grammar_topic_id.replace(/_/g, ' ')}
                </span>
                {detail.tags?.map(tag => (
                  <span key={tag} className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="text-gray-800 whitespace-pre-wrap">{detail.description}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
