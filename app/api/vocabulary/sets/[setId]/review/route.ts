import { NextResponse } from 'next/server';
import { authenticateUser, handleApiError, createSuccessResponse } from '@/utils/api-helpers';
import { vocabularyReviewService } from '@/services/vocabulary/vocabulary-review-service';

/**
 * GET /api/vocabulary/sets/[setId]/review
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

    const vocabulary = await vocabularyReviewService.getVocabularyForReview(setId);
    return createSuccessResponse({ vocabulary });
  } catch (error) {
    return handleApiError(error);
  }
}