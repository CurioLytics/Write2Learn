import { createSupabaseClient } from '@/services/supabase/auth-helpers';
import { handleReview } from '@/lib/fsrs/handler';

export interface VocabularyForReview {
  vocabulary_id: string;
  word: string;
  meaning: string;
  example?: string;
  next_review_at: string;
  ease_factor: number;
  interval: number;
  state: string;
}

export interface ReviewResult {
  success: boolean;
  vocabulary_id: string;
  next_review_at: string;
  stability: number;
  difficulty: number;
}

/**
 * Service for handling vocabulary review operations
 */
export class VocabularyReviewService {
  private supabase = createSupabaseClient();

  /**
   * Get vocabulary words due for review from a specific set
   */
  async getVocabularyForReview(setId: string): Promise<VocabularyForReview[]> {
    const { data, error } = await this.supabase
      .from('vocabulary_status')
      .select(`
        vocabulary_id,
        next_review_at,
        ease_factor,
        interval,
        state,
        vocabulary!inner (
          id,
          word,
          meaning,
          example,
          set_id
        )
      `)
      .eq('vocabulary.set_id', setId)
      .lte('next_review_at', new Date().toISOString())
      .limit(30);

    if (error) {
      console.error('Error fetching vocabulary for review:', error);
      throw new Error(`Database error: ${error.message}`);
    }

    return this.transformVocabularyData(data || []);
  }

  /**
   * Submit a review rating for a vocabulary word
   */
  async submitReview(vocabularyId: string, rating: number, userId?: string): Promise<ReviewResult> {
    if (!vocabularyId || rating === undefined) {
      throw new Error('vocabulary_id and rating are required');
    }

    if (rating < 1 || rating > 4) {
      throw new Error('Rating must be between 1 and 4');
    }

    const result = await handleReview(vocabularyId, rating);
    
    return {
      success: true,
      vocabulary_id: vocabularyId,
      next_review_at: result.next_review_at.toISOString(),
      stability: result.stability,
      difficulty: result.difficulty
    };
  }

  /**
   * Transform raw database data to vocabulary review format
   */
  private transformVocabularyData(data: any[]): VocabularyForReview[] {
    return data.map((item: any) => ({
      vocabulary_id: item.vocabulary.id,
      word: item.vocabulary.word,
      meaning: item.vocabulary.meaning,
      example: item.vocabulary.example,
      next_review_at: item.next_review_at,
      ease_factor: item.ease_factor,
      interval: item.interval,
      state: item.state
    }));
  }
}

export const vocabularyReviewService = new VocabularyReviewService();