import { NextResponse } from 'next/server';
import { authenticateUser, handleApiError, parseRequestBody, createSuccessResponse } from '@/utils/api-helpers';
import { flashcardService } from '@/services/flashcard-service';

/**
 * GET /api/flashcards
 * Get flashcard sets for the authenticated user
 */
export async function GET() {
  try {
    const user = await authenticateUser();
    const flashcardSets = await flashcardService.getFlashcardSets(user.id);
    
    return createSuccessResponse({ flashcardSets });
  } catch (error) {
    return handleApiError(error);
  }
}