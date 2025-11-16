import { NextResponse } from 'next/server';
import { authenticateUser, handleApiError, parseRequestBody, createSuccessResponse } from '@/utils/api-helpers';
import { vocabularyService } from '@/services/vocabulary-service';
import { handleReview } from '@/lib/fsrs/handler';

/**
 * GET /api/vocabulary
 * Get vocabulary sets for the authenticated user
 */
export async function GET() {
  try {
    const user = await authenticateUser();
    const vocabularySets = await vocabularyService.getVocabularySets(user.id);
    
    return createSuccessResponse({ vocabularySets });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/vocabulary
 * Submit a vocabulary review (rating) or create a new vocabulary set
 */
export async function POST(req: Request) {
  try {
    const user = await authenticateUser();
    const body = await parseRequestBody(req);

    // Check if this is a review submission
    if (body && typeof body === 'object' && 'vocabulary_id' in body && 'rating' in body) {
      const { vocabulary_id, rating } = body as { vocabulary_id: string; rating: number };
      
      if (!vocabulary_id || rating === undefined) {
        return NextResponse.json(
          { error: 'vocabulary_id and rating are required' },
          { status: 400 }
        );
      }

      const result = await handleReview(vocabulary_id, rating);
      return createSuccessResponse(result);
    }
    
    // Otherwise, create a new vocabulary set
    const { title, description, is_default = false } = body as { title?: string; description?: string; is_default?: boolean };
    
    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // For now, return a placeholder response since createVocabularySet is not implemented
    return NextResponse.json(
      { error: 'Vocabulary set creation not yet implemented' },
      { status: 501 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}