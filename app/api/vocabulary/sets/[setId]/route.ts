import { NextResponse } from 'next/server';
import { authenticateUser, handleApiError, parseRequestBody, createSuccessResponse } from '@/utils/api-helpers';
import { vocabularyManagementService } from '@/services/vocabulary/vocabulary-management-service';

/**
 * GET /api/vocabulary/sets/[setId]
 * Get vocabulary set details with all words
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

    const vocabularySet = await vocabularyManagementService.getVocabularySetDetail(setId, user.id);
    
    if (!vocabularySet) {
      return NextResponse.json(
        { error: 'Vocabulary set not found' },
        { status: 404 }
      );
    }

    return createSuccessResponse(vocabularySet);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PUT /api/vocabulary/sets/[setId]
 * Update vocabulary set and its words
 */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ setId: string }> }
) {
  try {
    const user = await authenticateUser();
    const { setId } = await params;
    const body = await parseRequestBody(req);
    
    if (!setId) {
      return NextResponse.json(
        { error: 'Set ID is required' },
        { status: 400 }
      );
    }

    const updatedSet = await vocabularyManagementService.updateVocabularySet(setId, user.id, body as any);
    return createSuccessResponse(updatedSet);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/vocabulary/sets/[setId]
 * Delete vocabulary set and all associated words
 */
export async function DELETE(
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

    await vocabularyManagementService.deleteVocabularySet(setId, user.id);
    return createSuccessResponse({ message: 'Vocabulary set deleted successfully' });
  } catch (error) {
    return handleApiError(error);
  }
}