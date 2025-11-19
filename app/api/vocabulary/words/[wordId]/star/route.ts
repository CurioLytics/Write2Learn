import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, handleApiError, createSuccessResponse } from '@/utils/api-helpers';
import { toggleVocabularyStar } from '@/utils/star-helpers';

/**
 * POST /api/vocabulary/words/[wordId]/star
 * Toggle star status for a vocabulary word
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { wordId: string } }
) {
  try {
    const user = await authenticateUser();
    const { wordId } = params;

    if (!wordId) {
      return NextResponse.json({ error: 'Word ID is required' }, { status: 400 });
    }

    const newStarredStatus = await toggleVocabularyStar(wordId);

    return createSuccessResponse({
      isStarred: newStarredStatus,
      wordId
    });
  } catch (error) {
    return handleApiError(error);
  }
}