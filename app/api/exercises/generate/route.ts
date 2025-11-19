import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { errorData } = await request.json();

    if (!errorData || !Array.isArray(errorData) || errorData.length === 0) {
      return NextResponse.json(
        { error: 'Error data is required and must be a non-empty array' },
        { status: 400 }
      );
    }

    // Send only the description content from error data
    const payloadText = errorData
      .map(error => error.description || 'Grammar error detected')
      .filter(description => description && description.trim())
      .join(' ');

    console.log('Real error data payload:', payloadText);

    console.log('Calling webhook with payload:', payloadText);

    // Call webhook with plain text payload
    const response = await fetch('https://auto2.elyandas.com/webhook/gen-exercise', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: payloadText
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
    
    // Handle multiple possible response structures
    let questions: string[] = [];
    
    // New structure: [{"text": "JSON_STRING"}]
    if (Array.isArray(webhookResponse) && webhookResponse[0]?.text) {
      try {
        const innerJson = JSON.parse(webhookResponse[0].text);
        if (Array.isArray(innerJson) && innerJson[0]?.question && Array.isArray(innerJson[0].question)) {
          questions = innerJson[0].question;
        }
      } catch (innerParseError) {
        console.log('Failed to parse inner JSON from text field:', innerParseError);
      }
    }
    // Fallback: Previous structures
    else if (Array.isArray(webhookResponse)) {
      // Case 1: [{"questions": [...]}] or [{"question": [...]}]
      if (webhookResponse[0]?.questions && Array.isArray(webhookResponse[0].questions)) {
        questions = webhookResponse[0].questions;
      }
      else if (webhookResponse[0]?.question && Array.isArray(webhookResponse[0].question)) {
        questions = webhookResponse[0].question;
      }
      // Case 2: [{"output": {"questions": [...]}}] or [{"output": {"question": [...]}}]
      else if (webhookResponse[0]?.output?.questions && Array.isArray(webhookResponse[0].output.questions)) {
        questions = webhookResponse[0].output.questions;
      }
      else if (webhookResponse[0]?.output?.question && Array.isArray(webhookResponse[0].output.question)) {
        questions = webhookResponse[0].output.question;
      }
    }
    // Handle direct object response (fallback)
    else if (webhookResponse?.questions && Array.isArray(webhookResponse.questions)) {
      questions = webhookResponse.questions;
    }
    else if (webhookResponse?.question && Array.isArray(webhookResponse.question)) {
      questions = webhookResponse.question;
    }
    else if (webhookResponse?.output?.questions && Array.isArray(webhookResponse.output.questions)) {
      questions = webhookResponse.output.questions;
    }
    else if (webhookResponse?.output?.question && Array.isArray(webhookResponse.output.question)) {
      questions = webhookResponse.output.question;
    }
    
    if (!questions || questions.length === 0) {
      console.log('No questions found in webhook response:', webhookResponse);
      return NextResponse.json(
        { error: 'No questions found in webhook response' },
        { status: 500 }
      );
    }

    console.log(`Successfully extracted ${questions.length} questions`);
    return NextResponse.json({ questions });

  } catch (error) {
    console.error('Error calling gen-exercise webhook:', error);
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Lỗi không xác định khi tạo bài tập' },
      { status: 500 }
    );
  }
}