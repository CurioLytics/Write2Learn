'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/auth/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/services/supabase/client';

interface VocabularyWord {
  word: string;
  meaning: string;
}

export default function CreateVocabSetPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [vocabularyWords, setVocabularyWords] = useState<VocabularyWord[]>([
    { word: '', meaning: '' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRefs = useRef<(HTMLTextAreaElement | null)[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [authLoading, user, router]);



  const addVocabularyWord = () => {
    const newIndex = vocabularyWords.length;
    setVocabularyWords([...vocabularyWords, { word: '', meaning: '' }]);
    setTimeout(() => {
      textareaRefs.current[newIndex * 2]?.focus();
    }, 0);
  };

  const updateVocabularyWord = (index: number, field: keyof VocabularyWord, value: string) => {
    const updatedWords = vocabularyWords.map((word, i) => 
      i === index ? { ...word, [field]: value } : word
    );
    setVocabularyWords(updatedWords);
  };

  const removeVocabularyWord = (index: number) => {
    if (vocabularyWords.length > 1) {
      setVocabularyWords(vocabularyWords.filter((_, i) => i !== index));
    }
  };

  const hasUnsavedData = () => {
    if (title.trim()) return true;
    if (description.trim()) return true;
    return vocabularyWords.some(word => word.word.trim() || word.meaning.trim());
  };

  const handleCancel = () => {
    if (hasUnsavedData()) {
      const confirmLeave = window.confirm(
        'You have unsaved changes. Are you sure you want to cancel? All data will be lost.'
      );
      if (!confirmLeave) return;
    }
    router.back();
  };

  const handleSave = async () => {
    if (!user?.id) {
      setError('User not authenticated');
      return;
    }

    // Creating new set - need title
    if (!title.trim()) {
      setError('Title is required for new vocabulary set');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create new vocabulary set
      const { data: setData, error: setError } = await supabase
        .from('vocabulary_set')
        .insert({
          title: title.trim(),
          description: description.trim() || null,
          profile_id: user.id,
        } as any)
        .select()
        .single();

      if (setError) throw setError;

      // Add vocabulary words if any are provided
      const validWords = vocabularyWords.filter(word => 
        word.word.trim() && word.meaning.trim()
      );

      if (validWords.length > 0) {
        const wordsToInsert = validWords.map(word => ({
          set_id: (setData as any).id,
          word: word.word.trim(),
          meaning: word.meaning.trim(),
        }));

        const { error: wordsError } = await supabase
          .from('vocabulary')
          .insert(wordsToInsert as any);

        if (wordsError) throw wordsError;
      }

      // Navigate back to vocab page
      router.push('/vocab');
    } catch (err: any) {
      console.error('Error saving vocabulary:', err);
      
      // Handle specific error cases
      if (err.code === '23505' && err.message?.includes('unique_profile_setname')) {
        setError('Đặt tên khác nhé - tên này đã được sử dụng rồi');
      } else {
        setError(err.message || 'Failed to save vocabulary');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8" style={{ fontFamily: 'var(--font-sans)' }}>
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create Vocabulary Set</h1>
              <p className="text-sm text-gray-600 mt-2">Tạo bộ từ vựng mới để học và ôn tập</p>
            </div>
            <div className="text-sm text-gray-600">{vocabularyWords.length} mục</div>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {/* Title Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter vocabulary set title..."
                className="w-full bg-gray-50 border border-gray-200"
              />
            </div>

            {/* Description Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent resize-none"
                placeholder="Enter description (optional)..."
              />
            </div>

            {/* Vocabulary Words Section */}
            <div>
              <div className="flex items-center mb-4">
                <h3 className="text-lg font-medium text-gray-800">Vocabulary Words</h3>
              </div>

              <div className="space-y-4">
                {vocabularyWords.map((word, index) => (
                  <div key={index} className="relative border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <button
                      onClick={() => removeVocabularyWord(index)}
                      className="absolute top-2 right-2 text-gray-500 hover:text-red-600 transition-colors text-lg"
                      aria-label={`Remove term ${index + 1}`}
                    >
                      ×
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Term
                        </label>
                        <textarea
                          ref={(el) => { textareaRefs.current[index * 2] = el; }}
                          value={word.word}
                          onChange={(e) => updateVocabularyWord(index, 'word', e.target.value)}
                          rows={2}
                          className="w-full p-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white"
                          placeholder="Enter term..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Meaning
                        </label>
                        <textarea
                          value={word.meaning}
                          onChange={(e) => updateVocabularyWord(index, 'meaning', e.target.value)}
                          rows={2}
                          className="w-full p-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white"
                          placeholder="Enter meaning..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Add Word Button at the end */}
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addVocabularyWord}
                  className="text-sm w-full"
                >
                  + Add Word
                </Button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 text-sm text-red-700 bg-red-50 p-3 rounded">{error}</div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between items-center mt-6 pt-4 border-t">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isLoading || !title.trim()}
              >
                {isLoading ? 'Saving...' : 'Save Vocabulary Set'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}