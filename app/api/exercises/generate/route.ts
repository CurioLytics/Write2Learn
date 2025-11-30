import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, getUserPreferences } from '@/utils/api-helpers';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user and get preferences
    const user = await authenticateUser();
    const userPreferences = await getUserPreferences(user.id);

    const body = await request.json();
    console.log('📥 [API] Raw request body:', JSON.stringify(body, null, 2));

    const { errorData, grammarTopics } = body;

    console.log('📥 [API] Extracted grammarTopics:', JSON.stringify(grammarTopics, null, 2));
    console.log('📥 [API] grammarTopics type:', typeof grammarTopics);
    console.log('📥 [API] grammarTopics is null?', grammarTopics === null);
    console.log('📥 [API] grammarTopics is undefined?', grammarTopics === undefined);
    console.log('📥 [API] grammarTopics keys:', grammarTopics ? Object.keys(grammarTopics) : 'null/undefined');
    console.log('📥 [API] grammarTopics values:', grammarTopics ? Object.values(grammarTopics) : 'null/undefined');
    console.log('📥 [API] grammarTopics entries:', grammarTopics ? Object.entries(grammarTopics) : 'null/undefined');

    if (!errorData || !Array.isArray(errorData) || errorData.length === 0) {
      return NextResponse.json(
        { error: 'Error data is required and must be a non-empty array' },
        { status: 400 }
      );
    }

    // Build structured JSON payload with new format
    const payload = {
      user_level: userPreferences.english_level,
      english_tone: userPreferences.style,
      topics: grammarTopics || {}
    };

    console.log('📤 [API] Final payload object:', payload);
    console.log('📤 [API] payload.topics:', payload.topics);
    console.log('📤 [API] payload.topics keys:', Object.keys(payload.topics));
    console.log('📤 [API] payload.topics values:', Object.values(payload.topics));

    const payloadString = JSON.stringify(payload);
    console.log('📤 [API] Stringified payload:', payloadString);
    console.log('📤 [API] Payload length:', payloadString.length);

    console.log('Exercise generation payload:', JSON.stringify(payload, null, 2));

    // Call webhook with JSON payload
    const webhookUrl = process.env.GET_GEN_EXERCISE_WEBHOOK_URL;
    if (!webhookUrl) {
      throw new Error('GET_GEN_EXERCISE_WEBHOOK_URL is not defined');
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: payloadString
    });

    console.log('Webhook response status:', response.status);
    console.log('Webhook response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      // Try to get error details from response
      let errorMessage = `Webhook failed: ${response.status} ${response.statusText}`;
      try {
        const errorText = await response.text();
        console.log('Webhook error response:', errorText);
        if (errorText) {
          errorMessage += ` - ${errorText}`;
        }
      } catch (e) {
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

    // Handle new nested structure: { output: [{ topic_name, exercise_type, quizzes: [...] }] }
    let exercises: any[] = [];

    // Structure 1: { output: [{ topic_name, exercise_type, quizzes }] }
    if (webhookResponse?.output && Array.isArray(webhookResponse.output)) {
      exercises = webhookResponse.output;
      console.log('Extracted exercises from output array (direct object):', exercises);
    }
    // Structure 2: [{ output: [{ topic_name, exercise_type, quizzes }] }]
    else if (Array.isArray(webhookResponse) && webhookResponse[0]?.output) {
      if (Array.isArray(webhookResponse[0].output)) {
        exercises = webhookResponse[0].output;
        console.log('Extracted exercises from output array (wrapped in array):', exercises);
      }
    }
    // Structure 3: Direct array of topic exercises
    else if (Array.isArray(webhookResponse) && webhookResponse[0]?.topic_name) {
      exercises = webhookResponse;
      console.log('Using direct array as exercises:', exercises);
    }

    // Validate exercises structure
    if (!exercises || exercises.length === 0) {
      console.log('No exercises found in webhook response:', webhookResponse);
      return NextResponse.json(
        { error: 'No exercises found in webhook response' },
        { status: 500 }
      );
    }

    // Validate each exercise has required fields
    const validExercises = exercises.filter(ex =>
      ex.topic_name && ex.exercise_type && Array.isArray(ex.quizzes) && ex.quizzes.length > 0
    );

    if (validExercises.length === 0) {
      console.log('No valid exercises with topic_name, exercise_type, and quizzes:', exercises);
      return NextResponse.json(
        { error: 'Invalid exercise structure from webhook' },
        { status: 500 }
      );
    }

    console.log(`Successfully extracted ${validExercises.length} topic exercises`);
    return NextResponse.json({ exercises: validExercises });

  } catch (error) {
    console.error('Error calling gen-exercise webhook:', error);

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Lỗi không xác định khi tạo bài tập' },
      { status: 500 }
    );
  }
}