import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { exercises } = await request.json();

    if (!exercises || !Array.isArray(exercises) || exercises.length === 0) {
      return NextResponse.json(
        { error: 'Exercises data is required and must be a non-empty array' },
        { status: 400 }
      );
    }

    // Format payload for grading webhook: questions + user answers
    const gradingPayload = exercises.map(ex => 
      `Question: ${ex.question}\nUser Answer: ${ex.userAnswer}`
    ).join('\n\n');

    const response = await fetch('https://auto2.elyandas.com/webhook/grade-exercise', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: gradingPayload,
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