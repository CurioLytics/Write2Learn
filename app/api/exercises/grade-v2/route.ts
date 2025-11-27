import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/utils/api-helpers';
import { GradingV2Payload } from '@/types/exercise';

export async function POST(request: NextRequest) {
  try {
    await authenticateUser();
    
    const body = await request.json() as GradingV2Payload;
    const { topics } = body;

    if (!topics || !Array.isArray(topics) || topics.length === 0) {
      return NextResponse.json(
        { error: 'Topics data is required and must be a non-empty array' },
        { status: 400 }
      );
    }

    // Validate each topic has required fields
    for (let i = 0; i < topics.length; i++) {
      const topic = topics[i];
      
      if (!topic.topic_name || !Array.isArray(topic.quizzes) || !Array.isArray(topic.user_answers)) {
        return NextResponse.json(
          { error: `Topic "${topic.topic_name || i}": topic_name, quizzes, and user_answers must all be arrays` },
          { status: 400 }
        );
      }
      
      if (topic.quizzes.length !== topic.user_answers.length) {
        return NextResponse.json(
          { 
            error: `Topic "${topic.topic_name}": quizzes (${topic.quizzes.length}) and user_answers (${topic.user_answers.length}) must have the same length` 
          },
          { status: 400 }
        );
      }
    }

    const payload = { topics };

    console.log('Grading payload:', JSON.stringify(payload, null, 2));

    const response = await fetch('https://auto2.elyandas.com/webhook/exercise-check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log('Webhook response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('Webhook error response:', errorText);
      return NextResponse.json(
        { error: `Webhook failed: ${response.status} ${response.statusText}${errorText ? ` - ${errorText}` : ''}` },
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

    // Extract output if it exists (handle both { output: {...} } and direct {...} formats)
    const gradingData = webhookResponse?.output || webhookResponse;

    if (typeof gradingData !== 'object' || gradingData === null) {
      return NextResponse.json(
        { error: 'Invalid response structure from webhook' },
        { status: 500 }
      );
    }

    console.log('Successfully graded exercises');
    return NextResponse.json(gradingData);

  } catch (error) {
    console.error('Error calling grade-exercise-v2 webhook:', error);
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Lỗi không xác định khi chấm bài' },
      { status: 500 }
    );
  }
}

