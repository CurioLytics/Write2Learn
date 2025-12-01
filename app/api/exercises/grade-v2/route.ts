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

    const webhookUrl = process.env.GET_EXERCISE_CHECK_WEBHOOK_URL;
    if (!webhookUrl) {
      throw new Error('GET_EXERCISE_CHECK_WEBHOOK_URL is not defined');
    }

    const response = await fetch(webhookUrl, {
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

    // Handle array response from n8n
    const responseData = Array.isArray(webhookResponse) ? webhookResponse[0] : webhookResponse;
    const outputData = responseData?.output || responseData;

    // Check if we have the new structure with 'results'
    if (outputData?.results && Array.isArray(outputData.results)) {
      const transformedData: Record<string, any[]> = {};

      outputData.results.forEach((topicResult: any) => {
        const topicName = topicResult.topic_name;
        const answers = topicResult.answers || [];

        transformedData[topicName] = answers.map((ans: any) => {
          if (typeof ans === 'string' && ans.startsWith('Wrong: ')) {
            return {
              correct: false,
              correct_answer: ans.replace('Wrong: ', '').trim()
            };
          } else {
            return {
              correct: true,
              correct_answer: typeof ans === 'string' ? ans : ''
            };
          }
        });
      });

      console.log('Successfully transformed grading data');
      return NextResponse.json(transformedData);
    }

    // Fallback/Legacy handling
    const gradingData = outputData;

    if (typeof gradingData !== 'object' || gradingData === null) {
      return NextResponse.json(
        { error: 'Invalid response structure from webhook' },
        { status: 500 }
      );
    }

    console.log('Successfully graded exercises (legacy format)');
    return NextResponse.json(gradingData);

  } catch (error) {
    console.error('Error calling https://auto2.elyandas.com/webhook/exercise-check webhook:', error);

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Lỗi không xác định khi chấm bài' },
      { status: 500 }
    );
  }
}

