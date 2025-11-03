'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/auth/use-auth';
import { useResponsive } from '@/hooks/common/use-responsive';
import { FlashcardSetList } from '@/app/vocab/components/vocab_list/flashcard-set-list';
import { FlashcardSet } from '@/types/vocab';
import { flashcardService } from '@/services/api/flashcard-service';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function VocabPage() {
  const { user } = useAuth();
  const { isMobile } = useResponsive();
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSets() {
      if (!user?.id) return;
      setLoading(true);
      setError(null);
      try {
        const sets = await flashcardService.getFlashcardSets(user.id);
        setFlashcardSets(sets);
      } catch (err) {
        console.error('Error loading flashcard sets:', err);
        setError('Không thể tải bộ từ vựng. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    }
    loadSets();
  }, [user?.id]);

  const handleReviewVocab = () => {
    console.log('Review vocabulary');
  };

  const handleStoryTranslation = () => {
    console.log('Story translation');
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b bg-card">
        <h1 className="text-lg font-semibold">Vocab Hub</h1>
        <Button variant="outline" size="sm" className="rounded-full text-sm">
          ↗ Xuất dữ liệu
        </Button>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          {/* Section header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-medium text-foreground">
              Bộ từ vựng của bạn
            </h2>
            {loading && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Loader2 className="animate-spin w-4 h-4 mr-2" /> Đang tải...
              </div>
            )}
          </div>

          {/* Flashcard sets */}
          <div className="mb-10">
            <FlashcardSetList
              flashcardSets={flashcardSets}
              isLoading={loading}
              error={error}
            />
          </div>

          {/* CTA buttons */}
          <div
            className={`flex ${
              isMobile ? 'flex-col gap-3' : 'justify-center gap-6'
            }`}
          >
            <Button
              onClick={handleReviewVocab}
              className="rounded-full px-6 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Ôn tập từ vựng
            </Button>
            <Button
              variant="secondary"
              onClick={handleStoryTranslation}
              className="rounded-full px-6"
            >
              Luyện dịch đoạn hội thoại
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
