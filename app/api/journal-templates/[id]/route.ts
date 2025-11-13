import { NextResponse } from 'next/server';
import { authenticateUser, handleApiError } from '@/utils/api-helpers';
import { journalTemplateService } from '@/services/journal-template-service';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authenticateUser();
    const template = await journalTemplateService.getTemplateByName(user.id, params.id);
    
    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json(template);
  } catch (error) {
    return handleApiError(error);
  }
}