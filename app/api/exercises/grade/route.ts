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
      exercises: exercises.map(ex => ({
        question: ex.question,
        userAnswer: ex.userAnswer
      }))
    };

    const response = await fetch('https://auto2.elyandas.com/webhook/grade-exercise', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.status} ${response.statusText}`);
    }

    // Handle both JSON and text responses from webhook
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      // If response is text, wrap it in expected format
      const text = await response.text();
      data = { feedback: text };
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error calling grade-exercise webhook:', error);
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Lỗi không xác định khi chấm bài' },
      { status: 500 }
    );
  }
}