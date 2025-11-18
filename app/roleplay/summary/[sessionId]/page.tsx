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
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center w-full">
          {processing ? 'Đang xử lý các đoạn nổi bật...' : 'Đang tải phiên hội thoại...'}
        </div>
      </div>
    );
  }

  if (error || !sessionData) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center w-full">
          <div className="text-red-600 mb-2">{error || 'Không tìm thấy phiên hội thoại'}</div>
          <Button onClick={handleBack} className="mt-2">Quay lại</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col" style={{ transition: '0.3s ease-in-out', width: '100%' }}>
      <div className="w-full max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Xem học được gì nào ^^</h1>
            <h2 className="text-lg text-gray-700">{sessionData.scenario_name}</h2>
          </div>
          <div className="flex flex-col md:flex-row gap-8 w-full mb-8">
            <div className="flex-1 flex flex-col" style={{ transition: '0.3s ease-in-out', width: '100%', background: 'oklch(1 0 0)' }}>
              <div className="min-h-[300px] p-0">
                <div id="conversation-content" className="space-y-3 max-h-[350px] overflow-y-auto">
                  {sessionData.messages?.map((message: any, index: number) => (
                    <MessageBubble 
                      key={index}
                      message={message}
                      roleName={message.sender === 'bot' ? sessionData.scenario?.ai_role : 'Bạn'}
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
            <div className="flex-1 flex flex-col" style={{ transition: '0.3s ease-in-out', width: '100%', background: 'oklch(1 0 0)' }}>
              <div className="min-h-[300px] p-0">
                <div id="feedback-content" className="whitespace-pre-wrap text-gray-800 leading-relaxed max-h-[350px] overflow-y-auto">
                  {sessionData.feedback || 'Chưa có phản hồi'}
                </div>
                <HighlightSelector
                  containerId="feedback-content"
                  onHighlightSaved={addHighlight}
                  highlights={highlights}
                />
              </div>
            </div>
          </div>
          {/* Đoạn nổi bật đã lưu */}
          <div className="w-full mb-8">
            <h3 className="text-base font-semibold text-gray-800 mb-3">Đoạn nổi bật đã lưu</h3>
            <div>
              <HighlightList highlights={highlights} onRemove={removeHighlight} />
            </div>
          </div>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          {/* Hành động */}
          <div className="flex justify-end gap-4 w-full">
            <Button variant="outline" onClick={handleBack}>
              Quay lại hội thoại
            </Button>
            <Button onClick={handleSave} disabled={processing}>
              {highlights.length > 0 ? 'Lưu & Tạo Flashcard' : 'Hoàn tất'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}