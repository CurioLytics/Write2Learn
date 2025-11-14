import { NextRequest, NextResponse } from 'next/server';
import { roleplayFeedbackService } from '@/services/roleplay-feedback-service';
import { RoleplayMessage, RoleplayScenario } from '@/types/roleplay';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { scenario, messages } = body;

    if (!scenario || !messages) {
      return NextResponse.json(
        { error: 'Scenario and messages are required' },
        { status: 400 }
      );
    }

    const feedback = await roleplayFeedbackService.generateFeedback(scenario, messages);
    
    return NextResponse.json({ feedback });
  } catch (error) {
    console.error('Error generating feedback:', error);
    return NextResponse.json(
      { error: 'Failed to generate feedback. Please try again.' },
      { status: 500 }
    );
  }
}