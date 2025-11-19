import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { authenticateUser, parseRequestBody, createSuccessResponse, handleApiError } from '@/utils/api-helpers';

interface FlashcardGenerationRequest {
  highlights: string[];
  content: string;
  title?: string;
}

interface FlashcardResponse {
  word: string;
  back: {
    definition: string;
    example: string;
  };
}

export async function POST(request: Request) {
  try {
    // Authenticate user
    const user = await authenticateUser();
    
    // Parse request body
    const { highlights, content, title } = await parseRequestBody<FlashcardGenerationRequest>(request);
    
    // Validate input
    if (!highlights || !Array.isArray(highlights) || highlights.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No highlights provided' },
        { status: 400 }
      );
    }
    
    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Content is required' },
        { status: 400 }
      );
    }
    
    // Get user's English level for context
    const supabase = createRouteHandlerClient({ cookies });
    const { data: profile } = await supabase
      .from('profiles')
      .select('level')
      .eq('id', user.id)
      .single();
    
    // Prepare webhook payload
    const webhookPayload = {
      highlights,
      content,
      title: title || 'Untitled Journal',
      level: profile?.level || null,
      userId: user.id
    };
    
    // Call external webhook
    const webhookUrl = process.env.NEXT_PUBLIC_SAVE_HIGHLIGHTS_WEBHOOK_URL;
    if (!webhookUrl) {
      return NextResponse.json(
        { success: false, error: 'Flashcard generation service not configured' },
        { status: 500 }
      );
    }
    
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload),
      signal: AbortSignal.timeout(60000), // 60 second timeout
    });
    
    if (!webhookResponse.ok) {
      console.error('Webhook error:', {
        status: webhookResponse.status,
        statusText: webhookResponse.statusText
      });
      
      return NextResponse.json(
        { success: false, error: 'Failed to generate flashcards from highlights' },
        { status: 500 }
      );
    }
    
    const responseData = await webhookResponse.json();
    
    // Normalize response to expected format
    let flashcards: FlashcardResponse[] = [];
    
    // Handle various response structures from the webhook
    if (Array.isArray(responseData)) {
      // If response is an array, check if first item has output property
      if (responseData.length > 0 && responseData[0].output) {
        flashcards = responseData[0].output;
      } else {
        flashcards = responseData;
      }
    } else if (responseData.output && Array.isArray(responseData.output)) {
      flashcards = responseData.output;
    } else if (responseData.flashcards && Array.isArray(responseData.flashcards)) {
      flashcards = responseData.flashcards;
    } else if (responseData.data && Array.isArray(responseData.data)) {
      flashcards = responseData.data;
    }
    
    console.log('Webhook response:', JSON.stringify(responseData, null, 2));
    console.log('Extracted flashcards:', JSON.stringify(flashcards, null, 2));
    
    // Validate flashcard format and normalize structure
    const validFlashcards = flashcards.filter((card: any) => 
      card && 
      typeof card.word === 'string' && 
      card.back && 
      typeof card.back.definition === 'string'
    ).map((card: any) => ({
      word: card.word,
      back: {
        definition: card.back.definition,
        example: card.back.example || 
                (card.back.synonyms ? `Synonyms: ${card.back.synonyms.join(', ')}` : '') || 
                ''
      }
    }));
    
    return createSuccessResponse({
      flashcards: validFlashcards,
      totalGenerated: validFlashcards.length,
      originalHighlights: highlights.length
    }, `Generated ${validFlashcards.length} flashcards from ${highlights.length} highlights`);
    
  } catch (error) {
    console.error('Flashcard generation error:', error);
    return handleApiError(error);
  }
}