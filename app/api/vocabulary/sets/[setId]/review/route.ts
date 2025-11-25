import { NextResponse } from 'next/server';
import { vocabularyReviewService } from '@/services/vocabulary/vocabulary-review-service';

/**
 * GET /api/vocabulary/sets/[setId]/review
 * Get vocabulary words due for review from a specific set
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ setId: string }> }
) {
  try {
    const { setId } = await params;
    
    if (!setId) {
      return NextResponse.json(
        { error: 'Set ID is required' },
        { status: 400 }
      );
    }

    const vocabulary = await vocabularyReviewService.getVocabularyForReview(setId);
    
    return NextResponse.json({ 
      vocabulary,
      count: vocabulary.length 
    });
  } catch (error: any) {
    console.error('Error fetching vocabulary for review:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch vocabulary for review' },
      { status: 500 }
    );
  }
}
