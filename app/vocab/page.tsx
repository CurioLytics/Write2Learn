'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/auth/use-auth';
import { Button } from '@/components/ui/button';
import { FlashcardSetList, VocabularySetList } from '@/app/vocab/components/vocab_list/flashcard-set-list';
import type { VocabularySetStats } from '@/types/flashcardSetStats';
import { supabase } from '@/services/supabase/client';
import type { Vocabulary } from '@/types/vocabulary';
import { getStarredVocabulary } from '@/utils/star-helpers';
import { toast } from 'sonner';

export default function VocabPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [flashcardSets, setFlashcardSets] = useState<VocabularySetStats[]>([]);
  const [isLoadingFlashcards, setIsLoadingFlashcards] = useState(true);
  const [flashcardError, setFlashcardError] = useState<string | null>(null);
  const [showStarredOnly, setShowStarredOnly] = useState(false);
  const [activeTab, setActiveTab] = useState<'sets' | 'starred-words'>('sets');
  const [starredWords, setStarredWords] = useState<Vocabulary[]>([]);
  const [isLoadingStarredWords, setIsLoadingStarredWords] = useState(false);

  // Filter sets based on starred status
  const filteredSets = showStarredOnly 
    ? flashcardSets.filter(set => set.is_starred)
    : flashcardSets;

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

  // Load starred words when switching to starred words tab
  useEffect(() => {
    if (activeTab === 'starred-words' && user?.id) {
      loadStarredWords();
    }
  }, [activeTab, user?.id]);

  const loadStarredWords = async () => {
    if (!user?.id) return;
    setIsLoadingStarredWords(true);
    try {
      const starred = await getStarredVocabulary();
      setStarredWords(starred);
    } catch (error: any) {
      console.error('Error loading starred words:', error);
      toast.error(error.message || 'Failed to load starred words');
    } finally {
      setIsLoadingStarredWords(false);
    }
  };

  const handleStarToggle = async (wordId: string) => {
    if (!user?.id) return;
    try {
      const response = await fetch(`/api/vocabulary/${wordId}/star`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });

      if (!response.ok) {
        throw new Error('Failed to toggle star');
      }

      const data = await response.json();
      const newStarredStatus = data.isStarred;
      
      // Refresh starred words if on that tab
      if (activeTab === 'starred-words') {
        await loadStarredWords();
      }
      toast.success(newStarredStatus ? 'Added to favorites' : 'Removed from favorites');
    } catch (error) {
      console.error('Error toggling star:', error);
      toast.error('Failed to update star status');
    }
  };

  const handleSelectSet = (setId: string) => {
    if (!setId) return;
    router.push(`/vocab/${setId}`);
  };

  return (
    <div
      className="flex-1 flex flex-col w-full"
      style={{ transition: "0.3s ease-in-out" }}
    >
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Compact Header - Center aligned like home */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Từ vựng</h1>
          <p className="text-gray-600 mb-6">
            Quản lý và ôn tập từ vựng tiếng Anh của bạn
          </p>
        </div>

        {/* Main Content - Compact */}
        <div className="max-w-4xl mx-auto bg-white shadow rounded-lg p-6">

          {/* Tabs */}
          <div className="mb-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('sets')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'sets'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Bộ từ vựng
              </button>
              <button
                onClick={() => setActiveTab('starred-words')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'starred-words'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                ⭐ Stared Words
              </button>
            </nav>
          </div>

          {activeTab === 'sets' ? (
            <>
              {/* Filter Toggle for Sets */}
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-800">
                </h2>
                <button
                  onClick={() => setShowStarredOnly(!showStarredOnly)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    showStarredOnly
                      ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                      : 'bg-gray-100 text-gray-600 border border-gray-300'
                  }`}
                  title={showStarredOnly ? 'Starred only' : 'Show all sets'}
                >
                  {showStarredOnly ? '⭐' : '☆'}
                </button>
              </div>

              <VocabularySetList
                vocabularySets={filteredSets}
                isLoading={isLoadingFlashcards}
                error={flashcardError}
                onSelectSet={handleSelectSet}
                onStarToggle={(setId: string, newStarredStatus: boolean) => {
                  setFlashcardSets(prev => prev.map(set => 
                    set.set_id === setId 
                      ? { ...set, is_starred: newStarredStatus }
                      : set
                  ));
                }}
              />
            </>
          ) : (
            <>
              {/* Starred Words View */}
              <div className="mb-6">
                <h2 className="text-lg font-medium text-gray-800 mb-4">
                </h2>
                
                {isLoadingStarredWords ? (
                  <div className="text-center py-8 text-gray-500">Chờ xíu...</div>
                ) : starredWords.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p className="mb-2">Chưa có từ nào được đánh dấu</p>
                    <p className="text-sm">Hãy đánh dấu một số từ trong bộ từ vựng để xem tại đây!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {starredWords.map((word) => (
                      <div
                        key={word.id}
                        className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-medium text-gray-900">{word.word}</h3>
                          <button
                            onClick={() => handleStarToggle(word.id)}
                            className="text-yellow-500 hover:text-yellow-600 transition-colors"
                            title="Bỏ đánh dấu"
                          >
                            ⭐
                          </button>
                        </div>
                        <p className="text-gray-700 text-sm mb-2">{word.meaning}</p>
                        {word.example && (
                          <p className="text-gray-500 text-xs italic">{word.example}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          <div className="mt-8 flex justify-center gap-3">
            <Button
              variant='default'
              onClick={() => router.push('/vocab/create')}
            >
              Thêm bộ
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
