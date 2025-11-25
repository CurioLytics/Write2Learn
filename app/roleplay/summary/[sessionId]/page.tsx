'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/auth/use-auth';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HighlightSelector } from '@/components/features/journal/editor/highlight-selector';
import { HighlightList } from '@/components/features/journal/editor/highlight-list';
import { MessageBubble } from '@/components/roleplay/message-bubble';
import { roleplaySessionService } from '@/services/roleplay/roleplay-session-service';
import { RoleplaySessionData } from '@/types/roleplay';
import { RoleplayFeedback, GrammarDetail } from '@/types/roleplay';
import { RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function RoleplaySummaryPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading, userPreferences: cachedPreferences } = useAuth();
  const [sessionData, setSessionData] = useState<RoleplaySessionData | null>(null);
  const [highlights, setHighlights] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Use cached preferences with defaults
  const userPreferences = {
    name: cachedPreferences?.name || 'User',
    english_level: cachedPreferences?.english_level || 'intermediate',
    style: cachedPreferences?.style || 'conversational',
  };

  const loadingSteps = ['clarity', 'vocabulary', 'grammar', 'ideas', 'enhanced version'];

  useEffect(() => {
    // Wait for auth to finish loading before checking user
    if (authLoading) return;
    
    if (!user) {
      router.push('/auth');
      return;
    }

    const loadSession = async () => {
      try {
        const data = await roleplaySessionService.getSessionWithFeedback(params.sessionId as string);
        setSessionData(data);
        setHighlights(data.highlights || []);
      } catch (err: any) {
        setError(err?.message || 'Failed to load session');
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, [user, authLoading, params.sessionId, router]);

  const addHighlight = (text: string) => {
    if (!highlights.includes(text)) {
      setHighlights([...highlights, text]);
    }
  };

  const removeHighlight = (index: number) => {
    setHighlights(highlights.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!user?.id || !sessionData || !highlights.length) {
      router.push('/roleplay');
      return;
    }
    
    setProcessing(true);
    setError(null);
    
    try {
      const result = await roleplaySessionService.saveHighlightsAndGenerateFlashcards(
        params.sessionId as string,
        highlights,
        sessionData,
        user.id
      );
      
      // Store flashcards and navigate to flashcard generation page
      localStorage.setItem('flashcardData', JSON.stringify(result.flashcards));
      router.push('/flashcards/generate');
    } catch (err: any) {
      setError(err?.message || 'Failed to save highlights');
      setProcessing(false);
    }
  };

  const handleRetryFeedback = async () => {
    setRetrying(true);
    setLoadingStep(0);
    setError(null);
    
    // Animate loading steps
    const interval = setInterval(() => {
      setLoadingStep(prev => {
        if (prev < loadingSteps.length - 1) return prev + 1;
        return prev;
      });
    }, 2000);
    
    try {
      // Pass preferences even if null - service will use defaults
      const feedback = await roleplaySessionService.retryFeedback(
        params.sessionId as string,
        cachedPreferences
      );
      
      // Clear interval IMMEDIATELY when response arrives
      clearInterval(interval);
      
      // Stop loading state BEFORE updating data
      setRetrying(false);
      setLoadingStep(0);
      
      // Then update state
      if (sessionData) {
        setSessionData({
          ...sessionData,
          feedback
        });
      }
    } catch (err: any) {
      clearInterval(interval);
      setRetrying(false);
      setLoadingStep(0);
      setError(err?.message || 'Failed to generate feedback');
    }
  };

  const handleBack = () => {
    router.push('/roleplay');
  };

  if (loading || processing) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center w-full">
          {processing ? 'Đang xử lý các đoạn nổi bật...' : 'Đang tải phiên hội thoại...'}
        </div>
      </div>
    );
  }

  if (retrying) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center w-full">
          <div className="mb-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)] mx-auto mb-4"></div>
            <p className="text-lg">
              <span className="text-gray-900">Checking your </span>
              <span className="text-[var(--primary)] font-medium">{loadingSteps[loadingStep]}</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !sessionData) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center w-full">
          <div className="text-red-600 mb-2">{error || 'Không tìm thấy phiên hội thoại'}</div>
          <div className="flex gap-2 justify-center">
            <Button onClick={handleBack} variant="outline" className="mt-2">Quay lại</Button>
            {error && (
              <Button onClick={() => window.location.reload()} className="mt-2">Thử lại</Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col" style={{ transition: '0.3s ease-in-out', width: '100%' }}>
      <div className="w-full max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Xem học được gì nào ^^</h1>
            <h2 className="text-lg text-gray-700 mb-4">{sessionData.scenario_name}</h2>
            
            {/* Messages Accordion */}
            <Accordion type="single" collapsible className="mb-6">
              <AccordionItem value="messages">
                <AccordionTrigger>Lịch sử hội thoại</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {sessionData.messages?.map((message: any, index: number) => (
                      <MessageBubble 
                        key={index}
                        message={message}
                        roleName={message.sender === 'bot' ? sessionData.scenario?.ai_role : 'Bạn'}
                        compact={true}
                      />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Feedback Tabs */}
          {sessionData.feedback ? (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Phản hồi</h3>
                <button
                  onClick={handleRetryFeedback}
                  disabled={retrying || !cachedPreferences}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
                  title="Tạo lại phản hồi"
                >
                  <RefreshCw className={`w-4 h-4 text-gray-600 ${retrying ? 'animate-spin' : ''}`} />
                </button>
              </div>
              
              <Tabs defaultValue="clarity" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="clarity">Clarity</TabsTrigger>
                  <TabsTrigger value="vocabulary">Vocabulary</TabsTrigger>
                  <TabsTrigger value="ideas">Ideas</TabsTrigger>
                  <TabsTrigger value="enhanced">Enhanced</TabsTrigger>
                </TabsList>
                
                <TabsContent value="clarity" className="mt-4">
                  <div id="clarity-content" className="whitespace-pre-wrap text-gray-800 leading-relaxed p-4 bg-gray-50 rounded-lg min-h-[200px]">
                    {sessionData.feedback.output?.clarity || 'Không có nội dung'}
                  </div>
                  <HighlightSelector
                    containerId="clarity-content"
                    onHighlightSaved={addHighlight}
                    highlights={highlights}
                  />
                </TabsContent>
                
                <TabsContent value="vocabulary" className="mt-4">
                  <div id="vocabulary-content" className="whitespace-pre-wrap text-gray-800 leading-relaxed p-4 bg-gray-50 rounded-lg min-h-[200px]">
                    {sessionData.feedback.output?.vocabulary || 'Không có nội dung'}
                  </div>
                  <HighlightSelector
                    containerId="vocabulary-content"
                    onHighlightSaved={addHighlight}
                    highlights={highlights}
                  />
                </TabsContent>
                
                <TabsContent value="ideas" className="mt-4">
                  <div id="ideas-content" className="whitespace-pre-wrap text-gray-800 leading-relaxed p-4 bg-gray-50 rounded-lg min-h-[200px]">
                    {sessionData.feedback.output?.ideas || 'Không có nội dung'}
                  </div>
                  <HighlightSelector
                    containerId="ideas-content"
                    onHighlightSaved={addHighlight}
                    highlights={highlights}
                  />
                </TabsContent>
                
                <TabsContent value="enhanced" className="mt-4">
                  <div id="enhanced-content" className="whitespace-pre-wrap text-gray-800 leading-relaxed p-4 bg-gray-50 rounded-lg min-h-[200px]">
                    {sessionData.feedback.enhanced_version || 'Không có nội dung'}
                  </div>
                  <HighlightSelector
                    containerId="enhanced-content"
                    onHighlightSaved={addHighlight}
                    highlights={highlights}
                  />
                </TabsContent>
              </Tabs>
              
              {/* Grammar Details */}
              {sessionData.feedback.grammar_details?.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Grammar Corrections</h3>
                  <div className="space-y-4">
                    {sessionData.feedback.grammar_details.map((detail: GrammarDetail, index: number) => (
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
              )}
            </div>
          ) : (
            <div className="mb-8 p-8 bg-gray-50 rounded-lg text-center">
              <p className="text-gray-500 mb-3">Chưa có phản hồi</p>
              <Button
                onClick={handleRetryFeedback}
                disabled={retrying || !cachedPreferences}
                size="sm"
                variant="outline"
              >
                Thử lại
              </Button>
            </div>
          )}

          {/* Highlights */}
          <div className="w-full mb-8">
            <h3 className="text-base font-semibold text-gray-800 mb-3">Highlighted</h3>
            <HighlightList highlights={highlights} onRemove={removeHighlight} />
          </div>
          
          {error && <p className="text-red-500 mb-4">{error}</p>}
          
          {/* Actions */}
          <div className="flex justify-end gap-4 w-full">
            <Button variant="outline" onClick={handleBack}>
              Hủy
            </Button>
            <Button onClick={handleSave} disabled={processing}>
              {highlights.length > 0 ? 'Lưu session & Tạo Flashcard' : 'Lưu session'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}