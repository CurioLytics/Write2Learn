import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, handleApiError, createSuccessResponse } from '@/utils/api-helpers';
import { toggleVocabularySetStar } from '@/utils/star-helpers';

/**
 * POST /api/vocabulary/sets/[setId]/star
 * Toggle star status for a vocabulary set
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { setId: string } }
) {
  try {
    const user = await authenticateUser();
    const { setId } = params;

    if (!setId) {
      return NextResponse.json({ error: 'Set ID is required' }, { status: 400 });
    }

    const newStarredStatus = await toggleVocabularySetStar(setId);

    return createSuccessResponse({
      isStarred: newStarredStatus,
      setId
    });
  } catch (error) {
    return handleApiError(error);
  }
}