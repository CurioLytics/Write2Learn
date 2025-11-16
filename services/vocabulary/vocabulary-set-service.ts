import { createSupabaseClient } from '@/services/supabase/auth-helpers';

export interface CreateVocabularySetRequest {
  title: string;
  description?: string;
  is_default?: boolean;
  vocabularyWords?: Array<{
    word: string;
    meaning: string;
    example?: string;
  }>;
}

export interface VocabularySetResponse {
  id: string;
  title: string;
  description?: string;
  profile_id: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  vocabulary_count: number;
}

/**
 * Service for handling vocabulary set operations
 */
export class VocabularySetService {
  private supabase = createSupabaseClient();

  /**
   * Create a new vocabulary set with optional vocabulary words
   */
  async createVocabularySet(
    userId: string, 
    request: CreateVocabularySetRequest
  ): Promise<VocabularySetResponse> {
    const { title, description, is_default = false, vocabularyWords = [] } = request;

    if (!title?.trim()) {
      throw new Error('Title is required');
    }

    // Create vocabulary set
    const { data: setData, error: setError } = await this.supabase
      .from('vocabulary_set')
      .insert({
        title: title.trim(),
        description: description?.trim() || null,
        profile_id: userId,
        is_default
      })
      .select()
      .single();

    if (setError) {
      console.error('Error creating vocabulary set:', setError);
      throw new Error(`Failed to create vocabulary set: ${setError.message}`);
    }

    // Add vocabulary words if provided
    let vocabularyCount = 0;
    if (vocabularyWords.length > 0) {
      vocabularyCount = await this.addVocabularyWords(setData.id, vocabularyWords);
    }

    return {
      id: setData.id,
      title: setData.title,
      description: setData.description,
      profile_id: setData.profile_id,
      is_default: setData.is_default,
      created_at: setData.created_at,
      updated_at: setData.updated_at,
      vocabulary_count: vocabularyCount
    };
  }

  /**
   * Add vocabulary words to a set
   */
  async addVocabularyWords(
    setId: string, 
    vocabularyWords: Array<{ word: string; meaning: string; example?: string; }>
  ): Promise<number> {
    const validWords = vocabularyWords.filter(word => 
      word.word?.trim() && word.meaning?.trim()
    );

    if (validWords.length === 0) {
      return 0;
    }

    const wordsToInsert = validWords.map(word => ({
      set_id: setId,
      word: word.word.trim(),
      meaning: word.meaning.trim(),
      example: word.example?.trim() || null
    }));

    const { error: wordsError } = await this.supabase
      .from('vocabulary')
      .insert(wordsToInsert);

    if (wordsError) {
      console.error('Error adding vocabulary words:', wordsError);
      throw new Error(`Failed to add vocabulary words: ${wordsError.message}`);
    }

    return validWords.length;
  }

  /**
   * Get vocabulary set details with word count
   */
  async getVocabularySet(setId: string, userId: string): Promise<VocabularySetResponse | null> {
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

    // Get vocabulary count
    const { count } = await this.supabase
      .from('vocabulary')
      .select('*', { count: 'exact', head: true })
      .eq('set_id', setId);

    return {
      id: setData.id,
      title: setData.title,
      description: setData.description,
      profile_id: setData.profile_id,
      is_default: setData.is_default,
      created_at: setData.created_at,
      updated_at: setData.updated_at,
      vocabulary_count: count || 0
    };
  }
}

export const vocabularySetService = new VocabularySetService();