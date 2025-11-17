import { createSupabaseClient } from '@/services/supabase/auth-helpers';

export interface VocabularyWord {
  id: string;
  word: string;
  meaning: string;
  example?: string;
  is_starred?: boolean;
}

export interface VocabularySetDetail {
  id: string;
  title: string;
  description?: string;
  profile_id: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  vocabulary: VocabularyWord[];
}

export interface UpdateVocabularySetRequest {
  title: string;
  description?: string;
  vocabularyWords: Array<{
    id: string;
    word: string;
    meaning: string;
    example?: string;
  }>;
}

/**
 * Service for handling vocabulary set and word management operations
 */
export class VocabularyManagementService {
  private supabase = createSupabaseClient();

  /**
   * Get vocabulary set with all words
   */
  async getVocabularySetDetail(setId: string, userId: string): Promise<VocabularySetDetail | null> {
    // Get vocabulary set
    const { data: setData, error: setError } = await this.supabase
      .from('vocabulary_set')
      .select('*')
      .eq('id', setId)
      .eq('profile_id', userId)
      .single();

    if (setError) {
      if (setError.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to get vocabulary set: ${setError.message}`);
    }

    // Get vocabulary words
    const { data: wordsData, error: wordsError } = await this.supabase
      .from('vocabulary')
      .select('id, word, meaning, example, is_starred')
      .eq('set_id', setId)
      .order('created_at', { ascending: true });

    if (wordsError) {
      throw new Error(`Failed to get vocabulary words: ${wordsError.message}`);
    }

    return {
      id: setData.id,
      title: setData.title,
      description: setData.description,
      profile_id: setData.profile_id,
      is_default: setData.is_default,
      created_at: setData.created_at,
      updated_at: setData.updated_at,
      vocabulary: wordsData || []
    };
  }

  /**
   * Update vocabulary set and manage words
   */
  async updateVocabularySet(
    setId: string, 
    userId: string, 
    request: UpdateVocabularySetRequest
  ): Promise<VocabularySetDetail> {
    const { title, description, vocabularyWords } = request;

    if (!title?.trim()) {
      throw new Error('Title is required');
    }

    // Update vocabulary set
    const { error: setError } = await this.supabase
      .from('vocabulary_set')
      .update({
        title: title.trim(),
        description: description?.trim() || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', setId)
      .eq('profile_id', userId);

    if (setError) {
      throw new Error(`Failed to update vocabulary set: ${setError.message}`);
    }

    // Manage vocabulary words
    await this.updateVocabularyWords(setId, vocabularyWords);

    // Return updated set
    const updatedSet = await this.getVocabularySetDetail(setId, userId);
    if (!updatedSet) {
      throw new Error('Failed to retrieve updated vocabulary set');
    }

    return updatedSet;
  }

  /**
   * Update vocabulary words for a set
   */
  private async updateVocabularyWords(
    setId: string,
    vocabularyWords: Array<{ id: string; word: string; meaning: string; example?: string; }>
  ) {
    // Get existing words
    const { data: existingWords } = await this.supabase
      .from('vocabulary')
      .select('id')
      .eq('set_id', setId);

    const existingIds = new Set(existingWords?.map(w => w.id) || []);
    
    // Separate new and existing words
    const newWords = vocabularyWords.filter(w => !w.id);
    const updatedWords = vocabularyWords.filter(w => w.id && existingIds.has(w.id));
    const retainedIds = new Set(updatedWords.map(w => w.id));
    
    // Delete removed words
    const toDelete = [...existingIds].filter(id => !retainedIds.has(id));
    if (toDelete.length > 0) {
      const { error: deleteError } = await this.supabase
        .from('vocabulary')
        .delete()
        .in('id', toDelete);
      
      if (deleteError) {
        throw new Error(`Failed to delete vocabulary words: ${deleteError.message}`);
      }
    }

    // Insert new words
    if (newWords.length > 0) {
      const wordsToInsert = newWords
        .filter(w => w.word?.trim() && w.meaning?.trim())
        .map(w => ({
          set_id: setId,
          word: w.word.trim(),
          meaning: w.meaning.trim(),
          example: w.example?.trim() || null
        }));

      if (wordsToInsert.length > 0) {
        const { error: insertError } = await this.supabase
          .from('vocabulary')
          .insert(wordsToInsert);

        if (insertError) {
          throw new Error(`Failed to insert vocabulary words: ${insertError.message}`);
        }
      }
    }

    // Update existing words
    for (const word of updatedWords) {
      if (word.word?.trim() && word.meaning?.trim()) {
        const { error: updateError } = await this.supabase
          .from('vocabulary')
          .update({
            word: word.word.trim(),
            meaning: word.meaning.trim(),
            example: word.example?.trim() || null
          })
          .eq('id', word.id);

        if (updateError) {
          throw new Error(`Failed to update vocabulary word: ${updateError.message}`);
        }
      }
    }
  }

  /**
   * Delete vocabulary set and all associated words
   */
  async deleteVocabularySet(setId: string, userId: string): Promise<void> {
    // Delete vocabulary words first (due to foreign key constraints)
    const { error: wordsError } = await this.supabase
      .from('vocabulary')
      .delete()
      .eq('set_id', setId);

    if (wordsError) {
      throw new Error(`Failed to delete vocabulary words: ${wordsError.message}`);
    }

    // Delete vocabulary set
    const { error: setError } = await this.supabase
      .from('vocabulary_set')
      .delete()
      .eq('id', setId)
      .eq('profile_id', userId);

    if (setError) {
      throw new Error(`Failed to delete vocabulary set: ${setError.message}`);
    }
  }

  /**
   * Toggle star status for a vocabulary word
   */
  async toggleVocabularyStar(vocabularyId: string): Promise<boolean> {
    // First get current star status
    const { data: currentData, error: fetchError } = await this.supabase
      .from('vocabulary')
      .select('is_starred')
      .eq('id', vocabularyId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to get vocabulary word: ${fetchError.message}`);
    }

    const newStarredStatus = !currentData.is_starred;

    // Update star status
    const { error: updateError } = await this.supabase
      .from('vocabulary')
      .update({ is_starred: newStarredStatus })
      .eq('id', vocabularyId);

    if (updateError) {
      throw new Error(`Failed to update star status: ${updateError.message}`);
    }

    return newStarredStatus;
  }

  /**
   * Get starred vocabulary words (optionally filtered by set)
   */
  async getStarredVocabulary(setId?: string): Promise<VocabularyWord[]> {
    let query = this.supabase
      .from('vocabulary')
      .select('id, word, meaning, example, is_starred')
      .eq('is_starred', true)
      .order('updated_at', { ascending: false });

    if (setId) {
      query = query.eq('set_id', setId);
    }

    const { data: wordsData, error: wordsError } = await query;

    if (wordsError) {
      throw new Error(`Failed to get starred vocabulary: ${wordsError.message}`);
    }

    return wordsData || [];
  }
}

export const vocabularyManagementService = new VocabularyManagementService();