import { NextResponse } from 'next/server';
import { authenticateUser, handleApiError, parseRequestBody, createSuccessResponse } from '@/utils/api-helpers';
import { vocabularyReviewService } from '@/services/vocabulary/vocabulary-review-service';

/**
 * POST /api/vocabulary/review
 * Submit a vocabulary review (rating)
 */
export async function POST(req: Request) {
  try {
    const user = await authenticateUser();
    const body = await parseRequestBody(req);

    const { vocabulary_id, rating } = body as { vocabulary_id: string; rating: number };
    
    if (!vocabulary_id || rating === undefined) {
      return NextResponse.json(
        { error: 'vocabulary_id and rating are required' },
        { status: 400 }
      );
    }

    const result = await vocabularyReviewService.submitReview(vocabulary_id, rating, user.id);
    return createSuccessResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}