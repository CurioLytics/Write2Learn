import { NextResponse } from 'next/server';
import { authenticateUser, handleApiError, createSuccessResponse } from '@/utils/api-helpers';
import { createSupabaseClient } from '@/services/supabase/auth-helpers';

/**
 * GET /api/vocabulary/[setId]/review
 * Get vocabulary words for review from a specific set
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ setId: string }> }
) {
  try {
    const user = await authenticateUser();
    const { setId } = await params;
    
    if (!setId) {
      return NextResponse.json(
        { error: 'Set ID is required' },
        { status: 400 }
      );
    }

    const supabase = createSupabaseClient();
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(setId)) {
      return NextResponse.json(
        { error: 'Invalid set ID format' },
        { status: 400 }
      );
    }
    
    
    // Instead of using RPC functions, let's use direct queries
    // Get vocabulary words due for review using direct query
    const { data, error } = await supabase
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

    if (error) {
      console.error('Error fetching vocabulary for review:', error);
      throw new Error(`Database error: ${(error as any)?.message || 'Unknown error'}`);
    }

    // Transform the data to match the expected format
    const vocabularyForReview = data?.map((item: any) => ({
      vocabulary_id: item.vocabulary.id,
      word: item.vocabulary.word,
      meaning: item.vocabulary.meaning,
      example: item.vocabulary.example,
      next_review_at: item.next_review_at,
      ease_factor: item.ease_factor,
      interval: item.interval,
      state: item.state
    })) || [];

    return createSuccessResponse({ vocabulary: vocabularyForReview });
  } catch (error) {
    return handleApiError(error);
  }
}