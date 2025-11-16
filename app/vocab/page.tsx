'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/auth/use-auth';
import { Button } from '@/components/ui/button';
import { FlashcardSetList, VocabularySetList } from '@/app/vocab/components/vocab_list/flashcard-set-list';
import type { FlashcardSetStats } from '@/types/flashcardSetStats';
import { supabase } from '@/services/supabase/client';

export default function VocabPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [flashcardSets, setFlashcardSets] = useState<FlashcardSetStats[]>([]);
  const [isLoadingFlashcards, setIsLoadingFlashcards] = useState(true);
  const [flashcardError, setFlashcardError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    const loadFlashcardSetStats = async () => {
      setIsLoadingFlashcards(true);
      setFlashcardError(null);
      try {
        const { data, error } = await (supabase.rpc as any)(
          'get_flashcard_set_stats',
          { user_uuid: user.id }
        );
        if (error) throw error;
        setFlashcardSets(data || []);
      } catch (err: any) {
        console.error('Error loading flashcard set stats:', err);
        setFlashcardError('Không thể tải danh sách flashcard. Vui lòng thử lại.');
      } finally {
        setIsLoadingFlashcards(false);
      }
    };
    loadFlashcardSetStats();
  }, [user?.id]);

  const handleSelectSet = (setId: string) => {
    if (!setId) return;
    router.push(`/vocab/${setId}`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Compact Header - Center aligned like homepage */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Vocabulary</h1>
        <p className="text-gray-600 mb-6">
          Quản lý và ôn tập từ vựng tiếng Anh của bạn
        </p>
      </div>

      {/* Main Content - Compact */}
      <div className="max-w-4xl mx-auto bg-white shadow rounded-lg p-6">

        <div className="space-y-6">
          <VocabularySetList
            vocabularySets={flashcardSets}
            isLoading={isLoadingFlashcards}
            error={flashcardError}
            onSelectSet={handleSelectSet}
          />

          <div className="flex justify-center gap-3">
            <Button
              className="px-5 py-2 text-sm rounded-full bg-green-600 hover:bg-green-700"
              onClick={() => router.push('/vocab/create')}
            >
              Thêm bộ từ vựng
            </Button>
            <Button
              className="px-5 py-2 text-sm rounded-full bg-blue-600 hover:bg-blue-700"
              onClick={() => router.push('/flashcards/review')}
            >
              Ôn tập từ vựng
            </Button>
            <Button
              variant="outline"
              className="px-5 py-2 text-sm rounded-full"
              onClick={() => router.push('/stories/translate')}
            >
              Dịch truyện
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
