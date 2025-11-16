'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/auth/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
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

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [authLoading, user, router]);

  const addVocabularyWord = () => {
    setVocabularyWords([...vocabularyWords, { word: '', meaning: '' }]);
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
    if (!user?.id || !title.trim()) {
      setError('Title is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create vocabulary set
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
      console.error('Error creating vocabulary set:', err);
      setError(err.message || 'Failed to create vocabulary set');
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Vocabulary Set</h1>
        <p className="text-gray-600">
          Tạo bộ từ vựng mới để học và ôn tập
        </p>
      </div>

      <Card className="bg-white shadow rounded-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-800">Vocabulary Set Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
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
              className="w-full"
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
              className="w-full p-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter description (optional)..."
            />
          </div>

          {/* Vocabulary Words Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-800">Vocabulary Words</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={addVocabularyWord}
                className="text-sm"
              >
                + Add Word
              </Button>
            </div>

            <div className="space-y-4">
              {vocabularyWords.map((word, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-700">Word #{index + 1}</h4>
                    {vocabularyWords.length > 1 && (
                      <button
                        onClick={() => removeVocabularyWord(index)}
                        className="text-gray-500 hover:text-red-600 transition-colors"
                        aria-label={`Remove word ${index + 1}`}
                      >
                        🗑️
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Word/Term
                      </label>
                      <Input
                        type="text"
                        value={word.word}
                        onChange={(e) => updateVocabularyWord(index, 'word', e.target.value)}
                        placeholder="Enter word or term..."
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Definition/Meaning
                      </label>
                      <Input
                        type="text"
                        value={word.meaning}
                        onChange={(e) => updateVocabularyWord(index, 'meaning', e.target.value)}
                        placeholder="Enter definition or meaning..."
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-sm text-red-700 bg-red-50 p-3 rounded-md border border-red-200">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
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
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isLoading ? 'Saving...' : 'Save Vocabulary Set'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}