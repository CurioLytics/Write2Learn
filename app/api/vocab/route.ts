// flashcard-service.ts
import { supabase } from '@/services/supabase/client';

export const flashcardService = {
  async getFlashcardSets(userId: string) {
    const { data, error } = await supabase.rpc('get_flashcard_set_stats', {
      user_uuid: userId,
    });

    if (error) {
      console.error('Supabase RPC error:', error);
      throw new Error(error.message);
    }

    return data || [];
  },
};
