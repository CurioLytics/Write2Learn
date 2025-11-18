"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from '@/hooks/auth/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { supabase } from '@/services/supabase/client';
import { toggleVocabularyStar } from '@/utils/star-helpers';
import { toast } from 'sonner';

interface VocabularyWord {
  id: string;
  word: string;
  meaning: string;
  example?: string;
  is_starred?: boolean;
}

interface VocabularySet {
  id: string;
  title: string;
  description?: string;
  profile_id: string;
}

export default function VocabularySetPage() {
  const params = useParams<{ setId: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const setId = params.setId;

  const [vocabularySet, setVocabularySet] = useState<VocabularySet | null>(null);
  const [vocabularyWords, setVocabularyWords] = useState<VocabularyWord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit state
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editWords, setEditWords] = useState<VocabularyWord[]>([]);
  const [originalEditData, setOriginalEditData] = useState({
    title: '',
    description: '',
    words: [] as VocabularyWord[]
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
      return;
    }

    if (setId && user?.id && !hasLoaded) {
      loadVocabularySet();
    }
  }, [setId, user?.id, authLoading, hasLoaded]);

  const loadVocabularySet = async () => {
    if (hasLoaded && vocabularySet) return; // Prevent duplicate loads
    
    setIsLoading(true);
    setError(null);

    try {
      // Load vocabulary set
      const { data: setData, error: setError } = await supabase
        .from('vocabulary_set')
        .select('*')
        .eq('id', setId)
        .single();

      if (setError) throw setError;
      setVocabularySet(setData);
      setEditTitle((setData as any).title);
      setEditDescription((setData as any).description || '');

      // Load vocabulary words
      const { data: wordsData, error: wordsError } = await supabase
        .from('vocabulary')
        .select('id, word, meaning, example, is_starred')
        .eq('set_id', setId)
        .order('created_at');

      if (wordsError) throw wordsError;
      setVocabularyWords(wordsData || []);
      setEditWords([...wordsData || []]);
      setHasLoaded(true); // Mark as loaded

    } catch (err: any) {
      console.error('Error loading vocabulary set:', err);
      setError(err.message || 'Failed to load vocabulary set');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartEdit = () => {
    setIsEditing(true);
    const originalData = {
      title: vocabularySet?.title || '',
      description: vocabularySet?.description || '',
      words: JSON.parse(JSON.stringify(vocabularyWords)) // Deep copy
    };
    setOriginalEditData(originalData);
    setEditTitle(originalData.title);
    setEditDescription(originalData.description);
    setEditWords([...vocabularyWords]);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditTitle(vocabularySet?.title || '');
    setEditDescription(vocabularySet?.description || '');
    setEditWords([...vocabularyWords]);
  };

  const addWord = () => {
    setEditWords([...editWords, { id: '', word: '', meaning: '' }]);
  };

  const updateWord = (index: number, field: keyof VocabularyWord, value: string) => {
    const updatedWords = editWords.map((word, i) => 
      i === index ? { ...word, [field]: value } : word
    );
    setEditWords(updatedWords);
  };

  const removeWord = (index: number) => {
    setEditWords(editWords.filter((_, i) => i !== index));
  };

  // Star toggle function for vocabulary words
  const handleStarToggle = async (wordId: string) => {
    if (!user) {
      toast.error('Please log in to star vocabulary');
      return;
    }

    try {
      const newStarredStatus = await toggleVocabularyStar(wordId);
      
      // Update local state
      setVocabularyWords(prev => prev.map(word => 
        word.id === wordId 
          ? { ...word, is_starred: newStarredStatus }
          : word
      ));
      
      // Also update edit state if in editing mode
      if (isEditing) {
        setEditWords(prev => prev.map(word => 
          word.id === wordId 
            ? { ...word, is_starred: newStarredStatus }
            : word
        ));
      }
      
      toast.success(newStarredStatus ? 'Starred' : 'Unstarred');
    } catch (error: any) {
      console.error('Error toggling star:', error);
      toast.error(error.message || 'Failed to update star status');
    }
  };

  // Change detection functions
  const hasMetadataChanged = () => {
    return editTitle.trim() !== originalEditData.title ||
           (editDescription.trim() || '') !== (originalEditData.description || '');
  };

  const getChangedWords = () => {
    return editWords.filter(editWord => {
      if (!editWord.id) return false; // Skip new words
      const originalWord = originalEditData.words.find(w => w.id === editWord.id);
      if (!originalWord) return false;
      
      return editWord.word.trim() !== originalWord.word ||
             editWord.meaning.trim() !== originalWord.meaning;
    });
  };

  const getNewWords = () => {
    return editWords.filter(word => !word.id && word.word.trim() && word.meaning.trim());
  };

  const getDeletedWordIds = () => {
    const editWordIds = new Set(editWords.filter(w => w.id).map(w => w.id));
    return originalEditData.words.map(w => w.id).filter(id => !editWordIds.has(id));
  };

  const handleSave = async () => {
    if (!vocabularySet || !editTitle.trim()) {
      setError('Title is required');
      return;
    }
    setIsSaving(true);
    setError(null);

    try {
      // Only update metadata if changed
      if (hasMetadataChanged()) {
        const { error: setError } = await (supabase as any)
          .from('vocabulary_set')
          .update({
            title: editTitle.trim(),
            description: editDescription.trim() || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', setId);

        if (setError) throw setError;
      }

      // Get changes
      const changedWords = getChangedWords();
      const newWords = getNewWords();
      const deletedWordIds = getDeletedWordIds();

      // Only update changed words
      for (const word of changedWords) {
        const { error: updateError } = await (supabase as any)
          .from('vocabulary')
          .update({
            word: word.word.trim(),
            meaning: word.meaning.trim(),
            updated_at: new Date().toISOString()
          })
          .eq('id', word.id);
        
        if (updateError) throw updateError;
      }

      // Insert new words
      if (newWords.length > 0) {
        const wordsToInsert = newWords.map(word => ({
          set_id: setId,
          word: word.word.trim(),
          meaning: word.meaning.trim()
        }));

        const { error: insertError } = await (supabase as any)
          .from('vocabulary')
          .insert(wordsToInsert);

        if (insertError) throw insertError;
      }

      // Delete removed words
      if (deletedWordIds.length > 0) {
        const { error: deleteError } = await supabase
          .from('vocabulary')
          .delete()
          .in('id', deletedWordIds);

        if (deleteError) throw deleteError;
      }

      // Performance logging
      console.log('🚀 Save Performance:', {
        metadataChanged: hasMetadataChanged(),
        wordsChanged: changedWords.length,
        wordsAdded: newWords.length,
        wordsDeleted: deletedWordIds.length
      });

      // Reload data
      setHasLoaded(false); // Reset to allow fresh data
      await loadVocabularySet();
      setIsEditing(false);

    } catch (err: any) {
      console.error('Error saving vocabulary set:', err);
      setError(err.message || 'Failed to save vocabulary set');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReview = () => {
    router.push(`/vocab/${setId}/review`);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Chờ xíu nhé</div>
      </div>
    );
  }

  if (isLoading && !vocabularySet) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading vocabulary...</div>
      </div>
    );
  }

  if (error && !vocabularySet) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center">
            <h2 className="text-xl font-medium text-gray-800 mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => router.back()}>Go Back</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-4 mb-2">
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? 'Edit Vocabulary Set' : vocabularySet?.title}
          </h1>
          {!isEditing && vocabularySet?.profile_id === user?.id && (
            <button
              onClick={handleStartEdit}
              className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
              aria-label="Edit vocabulary set"
            >
              ✏️
            </button>
          )}
        </div>
        <p className="text-gray-600 mb-6">
          {isEditing ? 'Edit your vocabulary set' : vocabularySet?.description || 'Vocabulary collection'}
        </p>

        {/* Action Buttons - Moved to top */}
        <div className="flex justify-center gap-4 mb-4">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={handleCancelEdit}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving || !editTitle.trim()}
                variant="outline"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => router.back()}
              >
                Back
              </Button>
              <Button
                onClick={handleReview}
                variant="default"
                disabled={vocabularyWords.length === 0}
              >
                Review Flashcards
              </Button>
            </>
          )}
        </div>
      </div>

      <Card className="bg-white shadow rounded-lg">
        <CardHeader>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {isEditing && (
            <>
              {/* Title Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
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
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  className="w-full p-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter description (optional)..."
                />
              </div>
            </>
          )}

          {/* Vocabulary Words Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-800">
                Vocabulary Words ({(isEditing ? editWords : vocabularyWords).length})
              </h3>
              {isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addWord}
                  className="text-sm"
                >
                  + Add Word
                </Button>
              )}
            </div>

            <div className="space-y-4">
              {(isEditing ? editWords : vocabularyWords).map((word, index) => (
                <div key={word.id || index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {/* Star Button - only show for existing words with IDs */}
                      {word.id && !isEditing && (
                        <button
                          onClick={() => handleStarToggle(word.id)}
                          className={`p-1 rounded transition-colors ${
                            word.is_starred 
                              ? 'text-yellow-500 hover:text-yellow-600' 
                              : 'text-gray-400 hover:text-yellow-500'
                          }`}
                          aria-label={word.is_starred ? 'Unstar word' : 'Star word'}
                          title={word.is_starred ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          {word.is_starred ? '⭐' : '☆'}
                        </button>
                      )}
                      {isEditing && (
                        <button
                          onClick={() => removeWord(index)}
                          className="text-gray-500 hover:text-red-600 transition-colors"
                          aria-label={`Remove word ${index + 1}`}
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Word/Term
                      </label>
                      {isEditing ? (
                        <Input
                          type="text"
                          value={word.word}
                          onChange={(e) => updateWord(index, 'word', e.target.value)}
                          placeholder="Enter word or term..."
                          className="w-full"
                        />
                      ) : (
                        <div className="w-full p-3 border border-gray-200 rounded-md bg-white text-gray-800">
                          {word.word}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Definition/Meaning
                      </label>
                      {isEditing ? (
                        <Input
                          type="text"
                          value={word.meaning}
                          onChange={(e) => updateWord(index, 'meaning', e.target.value)}
                          placeholder="Enter definition or meaning..."
                          className="w-full"
                        />
                      ) : (
                        <div className="w-full p-3 border border-gray-200 rounded-md bg-white text-gray-800">
                          {word.meaning}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {vocabularyWords.length === 0 && !isEditing && (
                <div className="text-center py-12 text-gray-500">
                  No vocabulary words found in this set.
                </div>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-sm text-red-700 bg-red-50 p-3 rounded-md border border-red-200">
              {error}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
