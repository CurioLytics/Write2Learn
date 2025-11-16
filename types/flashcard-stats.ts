// vocabulary-stats.ts
import { supabase } from '@/services/supabase/client';

export const vocabularyService = {
  async getVocabularySetStats(profile_id: string) {
    const { data, error } = await supabase.rpc('get_vocabulary_set_stats', {
      user_uuid: profile_id,
    } as any);

    if (error) {
      console.error('Supabase RPC error:', error);
      throw new Error(error.message);
    }

    return data || [];
  },
};

// Legacy export for backward compatibility
export const flashcardService = vocabularyService;
