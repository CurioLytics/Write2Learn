'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/auth/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LoadingState, ErrorState } from '@/components/ui/common/state-components';
import { HighlightSelector } from '@/components/journal/highlight-selector-new';
import { HighlightList } from '@/components/features/journal/editor/highlight-list';
import { MessageBubble } from '@/components/roleplay/message-bubble';
import { roleplaySessionService } from '@/services/roleplay-session-service';

export default function RoleplaySummaryPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [sessionData, setSessionData] = useState<any>(null);
  const [highlights, setHighlights] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
  }, [user, params.sessionId, router]);

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
    
    try {
      const data = await roleplaySessionService.saveHighlightsAndGenerateFlashcards(
        params.sessionId as string,
        highlights,
        sessionData,
        user.id
      );
      
      localStorage.setItem('flashcardData', JSON.stringify(data));
      router.push('/flashcards/create');
    } catch (err: any) {
      setError(err?.message || 'Failed to save highlights');
      setProcessing(false);
    }
  };

  const handleBack = () => {
    router.push('/roleplay');
  };

  if (loading || processing) {
    return <LoadingState message={processing ? 'Processing highlights' : 'Loading session'} />;
  }

  if (error || !sessionData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto p-6">
          <ErrorState message={error || 'Session not found'} onRetry={handleBack} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle>Roleplay Summary - {sessionData.scenario_name}</CardTitle>
          </CardHeader>
          <CardContent>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              
              {/* Conversation History */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  Conversation History
                </h3>
                <div className="p-4 rounded-lg border-2 border-purple-200 bg-purple-50 min-h-[500px]">
                  <div id="conversation-content" className="space-y-3 max-h-[450px] overflow-y-auto">
                    {sessionData.messages?.map((message: any, index: number) => (
                      <MessageBubble 
                        key={index}
                        message={message}
                        roleName={message.sender === 'bot' ? sessionData.scenario?.ai_role : 'You'}
                        compact={true}
                      />
                    ))}
                  </div>
                  <HighlightSelector
                    containerId="conversation-content"
                    onHighlightSaved={addHighlight}
                    highlights={highlights}
                  />
                </div>
              </div>

              {/* Assessment Feedback */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  Assessment Feedback
                </h3>
                <div className="p-4 rounded-lg border-2 border-blue-200 bg-blue-50 min-h-[500px]">
                  <div id="feedback-content" className="whitespace-pre-wrap text-gray-800 leading-relaxed max-h-[450px] overflow-y-auto">
                    {sessionData.feedback || 'Feedback not available'}
                  </div>
                  <HighlightSelector
                    containerId="feedback-content"
                    onHighlightSaved={addHighlight}
                    highlights={highlights}
                  />
                </div>
              </div>
            </div>

            {/* Highlights */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Saved Highlights</h3>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <HighlightList highlights={highlights} onRemove={removeHighlight} />
              </div>
            </div>

            {error && <p className="text-red-500 mb-4">{error}</p>}

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-4 border-t">
              <Button variant="outline" onClick={handleBack}>
                Back to Roleplay
              </Button>
              <Button onClick={handleSave} disabled={processing}>
                {highlights.length > 0 ? 'Save and Create Flashcards' : 'Done'}
              </Button>
            </div>
            
          </CardContent>
        </Card>
      </div>
    </div>
  );
}