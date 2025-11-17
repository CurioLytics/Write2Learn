import { createSupabaseClient } from '@/services/supabase/auth-helpers';
import { VocabularySet, Vocabulary } from '@/types/vocabulary';

/**
 * Service for fetching and managing vocabulary sets
 */
class VocabularyService {
  /**
   * Get all vocabulary sets for a user
   * 
   * @param userId The user ID to fetch vocabulary sets for
   * @returns Promise with array of vocabulary sets
   */
  async getVocabularySets(userId: string): Promise<VocabularySet[]> {
    try {
      console.log('getVocabularySets - userId being passed:', userId);
      
      const supabase = createSupabaseClient();
      
      // Call the get_flashcard_sets Supabase function (function name will be updated separately)
      const { data, error } = await supabase
        .rpc('get_flashcard_sets', { profile: userId });
      
      console.log('getVocabularySets - Response from Supabase:', { data, error });
      
      if (error) {
        console.error('Error fetching vocabulary sets:', error);
        throw error;
      }
      
      if (!data || !Array.isArray(data)) {
        console.warn('Invalid data structure returned from get_flashcard_sets:', data);
        return [];
      }
      
      console.log('getVocabularySets - Processed data to return:', data?.length, 'sets');
      
      return data.map(set => ({
        set_id: set.set_id,
        set_title: set.set_title,
        total_vocabulary: set.total_flashcards, // Map flashcard count to vocabulary count
        vocabulary_due: set.flashcards_due // Map flashcard due to vocabulary due
      }));
    } catch (error) {
      console.error('Error in getVocabularySets:', error);
      throw error;
    }
  }

  /**
   * Toggle star status for a vocabulary word
   */
  async toggleVocabularyStar(vocabularyId: string, userId: string): Promise<boolean> {
    try {
      const supabase = createSupabaseClient();
      
      // First get current star status
      const { data: currentVocab, error: fetchError } = await supabase
        .from('vocabulary')
        .select('is_starred')
        .eq('id', vocabularyId)
        .single();
      
      if (fetchError) {
        console.error('Error fetching vocabulary for star toggle:', fetchError);
        throw fetchError;
      }
      
      // Toggle the star status
      const newStarStatus = !currentVocab.is_starred;
      
      const { error: updateError } = await supabase
        .from('vocabulary')
        .update({ is_starred: newStarStatus })
        .eq('id', vocabularyId);
      
      if (updateError) {
        console.error('Error updating vocabulary star:', updateError);
        throw updateError;
      }
      
      return newStarStatus;
    } catch (error) {
      console.error('Error in toggleVocabularyStar:', error);
      throw error;
    }
  }

  /**
   * Get all starred vocabulary words for a user
   */
  async getStarredVocabulary(userId: string): Promise<Vocabulary[]> {
    try {
      const supabase = createSupabaseClient();
      
      const { data, error } = await supabase
        .from('vocabulary')
        .select(`
          id,
          word,
          meaning,
          example,
          is_starred,
          vocabulary_set!inner(profile_id)
        `)
        .eq('is_starred', true)
        .eq('vocabulary_set.profile_id', userId)
        .order('word');
      
      if (error) {
        console.error('Error fetching starred vocabulary:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getStarredVocabulary:', error);
      throw error;
    }
  }

  /**
   * Get all starred vocabulary sets for a user
   */
  async getStarredVocabularySets(userId: string): Promise<VocabularySet[]> {
    try {
      const supabase = createSupabaseClient();
      
      const { data, error } = await supabase
        .from('vocabulary_set')
        .select('*')
        .eq('is_starred', true)
        .eq('profile_id', userId)
        .order('title');
      
      if (error) {
        console.error('Error fetching starred vocabulary sets:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getStarredVocabularySets:', error);
      throw error;
    }
  }
}

export const vocabularyService = new VocabularyService();