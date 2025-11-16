import { createSupabaseClient } from '@/services/supabase/auth-helpers';
import { VocabularySet } from '@/types/vocabulary';

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
}

export const vocabularyService = new VocabularyService();