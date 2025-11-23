import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, getUserPreferences } from '@/utils/api-helpers';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user and get preferences
    const user = await authenticateUser();
    const userPreferences = await getUserPreferences(user.id);
    
    const { exercises } = await request.json();

    if (!exercises || !Array.isArray(exercises) || exercises.length === 0) {
      return NextResponse.json(
        { error: 'Exercises data is required and must be a non-empty array' },
        { status: 400 }
      );
    }

    // Build structured JSON payload with user preferences
    const payload = {
      user: {
        name: userPreferences.name,
        english_level: userPreferences.english_level,
        style: userPreferences.style,
      },
      exercises: exercises.map(exercise => ({
        question: exercise.question,
        answer: exercise.answer
      }))
    };

    console.log('Exercise check payload:', JSON.stringify(payload, null, 2));

    const response = await fetch('https://auto2.elyandas.com/webhook/exercise-check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    console.log('Webhook response status:', response.status);

    if (!response.ok) {
      let errorMessage = `Webhook failed: ${response.status} ${response.statusText}`;
      try {
        const errorText = await response.text();
        console.log('Webhook error response:', errorText);
        if (errorText) {
          errorMessage += ` - ${errorText}`;
        }
      } catch {
        console.log('Could not parse error response');
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    const responseText = await response.text();
    console.log('Webhook response text:', responseText);

    let webhookResponse;
    try {
      webhookResponse = JSON.parse(responseText);
    } catch (parseError) {
      console.log('Failed to parse webhook response as JSON:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON response from webhook' },
        { status: 500 }
      );
    }
    
    // Handle webhook response - expect array with output.correction structure
    let corrections: string[] = [];
    
    if (Array.isArray(webhookResponse)) {
      // Case 1: [{"output": {"correction": [...]}}]
      if (webhookResponse[0]?.output?.correction && Array.isArray(webhookResponse[0].output.correction)) {
        corrections = webhookResponse[0].output.correction;
      }
    }
    // Handle direct object response (fallback)
    else if (webhookResponse?.output?.correction && Array.isArray(webhookResponse.output.correction)) {
      corrections = webhookResponse.output.correction;
    }
    // Legacy format fallback
    else if (Array.isArray(webhookResponse)) {
      corrections = webhookResponse;
    } else if (webhookResponse?.corrections && Array.isArray(webhookResponse.corrections)) {
      corrections = webhookResponse.corrections;
    }
    
    console.log(`Successfully extracted ${corrections.length} corrections`);
    return NextResponse.json({ corrections });

  } catch (error) {
    console.error('Error calling exercise-check webhook:', error);
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Lỗi không xác định khi kiểm tra bài tập' },
      { status: 500 }
    );
  }
}