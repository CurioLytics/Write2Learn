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
function useJournalFeedback() {
  const searchParams = useSearchParams();
  const [feedback, setFeedback] = useState<any | null>(null);
  const [journalId, setJournalId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Get feedback from sessionStorage instead of URL
      const storedFeedback = sessionStorage.getItem('journalFeedback');
      if (!storedFeedback) throw new Error('No feedback data found.');
      
      const parsed = JSON.parse(storedFeedback);
      setFeedback(Array.isArray(parsed) ? parsed[0] : parsed);
      
      // Get journal ID if editing existing journal
      const id = searchParams?.get('id');
      setJournalId(id);
      
      // Clear sessionStorage after reading to avoid stale data
      // sessionStorage.removeItem('journalFeedback');
    } catch (err) {
      setError('Failed to load feedback data.');
    }
  }, [searchParams]);

  return { feedback, journalId, error };
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

// Save function
async function saveJournalAndHighlights({
  userId, feedback, highlights, title, journalId
}: {
  userId: string; feedback: any; highlights: string[]; title: string; journalId?: string | null;
}) {
  const originalContent = feedback.fixed_typo || feedback.originalVersion || '';
  const enhancedContent = feedback.enhanced_version || feedback.improvedVersion || '';
  
  let resultId: string;
  
  if (journalId) {
    await journalService.updateJournal(journalId, {
      title,
      content: enhancedContent || originalContent,
      enhanced_version: enhancedContent,
    });
    resultId = journalId;
  } else {
    const result = await journalService.createJournalFromFeedback(userId, {
      title,
      originalContent,
      enhancedContent,
      journalDate: new Date().toISOString(),
      highlights,
    });
    resultId = result.id;
  }
  
  // Save feedback to feedbacks and feedback_grammar_items tables
  try {
    await feedbackLogsService.saveFeedback({
      userId,
      sourceId: resultId,
      sourceType: 'journal',
      feedbackData: {
        clarity: feedback.output?.clarity,
        vocabulary: feedback.output?.vocabulary,
        ideas: feedback.output?.ideas,
        enhanced_version: enhancedContent,
      },
      grammarDetails: feedback.grammar_details || [],
    });
  } catch (error) {
    console.error('Failed to save feedback:', error);
  }
  
  // Generate flashcards
  let flashcardData = null;
  if (highlights?.length > 0) {
    try {
      const result = await flashcardGenerationService.generateFromJournal(
        { id: userId, name: 'User', english_level: 'intermediate', style: 'conversational' },
        title,
        enhancedContent || originalContent,
        highlights
      );
      flashcardData = result.flashcards;
    } catch (error) {
      console.error('Error generating flashcards:', error);
    }
  }
  
  return { id: resultId, success: true, flashcards: flashcardData };
}

export default function JournalFeedbackPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { feedback, journalId, error } = useJournalFeedback();
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
        journalId, // Pass journal ID for updating existing journal
      });

      if (redirectToFlashcards && highlights.length && data.flashcards) {
        // Store generated flashcards for the creation page
        localStorage.setItem('flashcardData', JSON.stringify(data.flashcards));
        router.push('/flashcards/generate');
      } else if (redirectToFlashcards && highlights.length) {
        // Fallback: redirect even if flashcard generation failed
        router.push('/flashcards/generate');
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
    );
  }

  if (error || !feedback) {
    return (
      <div className="w-full max-w-3xl mx-auto px-4 py-10">
        <Card className="bg-white rounded-lg shadow-sm p-6 border-0">
          <CardContent>
            <ErrorState message={error || 'Feedback not found'} onRetry={() => router.back()} />
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
              <div className="whitespace-pre-wrap text-blue-600">{feedback.summary}</div>
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
                <TabsTrigger value="clarity">Clarity</TabsTrigger>
                <TabsTrigger value="vocabulary">Vocabulary</TabsTrigger>
                <TabsTrigger value="ideas">Ideas</TabsTrigger>
                <TabsTrigger value="enhanced">Enhanced</TabsTrigger>
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
