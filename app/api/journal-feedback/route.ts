import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { 
  JournalFeedbackRequest, 
  JournalFeedbackResponse,
  WebhookResponse, 
  WebhookFeedbackResponse,
  FeedbackServiceResult 
} from '@/types/journal-feedback';
import { authenticateUser, handleApiError, getUserPreferences } from '@/utils/api-helpers';

/**
 * Configuration for the feedback service
 */
const FEEDBACK_CONFIG = {
  TIMEOUT_MS: 60000,
  MAX_RETRIES: 1,
  WEBHOOK_URL: process.env.NEXT_PUBLIC_GET_FEEDBACK_WEBHOOK_URL,
} as const;

/**
 * Journal feedback API route - no fallbacks, show real errors
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Authenticate user
    const user = await authenticateUser();
    
    const body: JournalFeedbackRequest = await req.json();
    
    // Validate request body
    if (!body.content || typeof body.content !== 'string') {
      return NextResponse.json(
        { error: 'Content is required and must be a string' },
        { status: 400 }
      );
    }

    // Check if webhook URL is configured
    if (!FEEDBACK_CONFIG.WEBHOOK_URL) {
      console.error('NEXT_PUBLIC_GET_FEEDBACK_WEBHOOK_URL environment variable is not configured');
      return NextResponse.json(
        { error: 'Feedback service not configured. Missing NEXT_PUBLIC_GET_FEEDBACK_WEBHOOK_URL environment variable.' },
        { status: 500 }
      );
    }

    // Get user preferences (cached from profiles table)
    const userPreferences = await getUserPreferences(user.id);

    // Make the request with user preferences included
    const feedback = await requestFeedbackWithRetry(body, userPreferences);
    
    return NextResponse.json(feedback, { status: 200 });
    
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Make feedback request with retry logic
 */
async function requestFeedbackWithRetry(
  body: JournalFeedbackRequest,
  userPreferences: { name: string; english_level: string; style: string },
  retryCount = 0
): Promise<JournalFeedbackResponse> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FEEDBACK_CONFIG.TIMEOUT_MS);

    console.log(`Making feedback request to: ${FEEDBACK_CONFIG.WEBHOOK_URL}`);
    console.log('Request payload:', JSON.stringify(body, null, 2));

    const response = await fetch(FEEDBACK_CONFIG.WEBHOOK_URL!, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'User-Agent': 'journal-feedback/1.0'
      },
      body: JSON.stringify({
        user: {
          name: userPreferences.name,
          english_level: userPreferences.english_level,
          style: userPreferences.style,
        },
        content: body.content,
        title: body.title || '',
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log(`Response status: ${response.status}`);
    
    if (!response.ok) {
      const responseText = await response.text();
      console.error(`Webhook error response: ${responseText}`);
      throw new Error(`Webhook responded with status: ${response.status}. Response: ${responseText}`);
    }

    const data = await response.json();
    console.log('Webhook response:', JSON.stringify(data, null, 2));
    
    return normalizeFeedbackResponse(data, body);
    
  } catch (error) {
    console.error(`Feedback request failed (attempt ${retryCount + 1}):`, error);
    
    // Retry once if it's the first attempt and not an abort error
    if (retryCount < FEEDBACK_CONFIG.MAX_RETRIES && !isAbortError(error)) {
      console.log('Retrying request...');
      return requestFeedbackWithRetry(body, userPreferences, retryCount + 1);
    }
    
    // Throw the error instead of returning fallback data
    throw new Error(`Webhook request failed after ${retryCount + 1} attempts: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Normalize the response from the webhook to ensure consistent structure
 */
function normalizeFeedbackResponse(
  data: any,
  originalRequest: JournalFeedbackRequest
): JournalFeedbackResponse {
  // Handle different response structures from the webhook
  const feedback = Array.isArray(data) && data[0]
    ? data[0]
    : data;

  // Validate that we have the required fields
  if (!feedback) {
    throw new Error('Webhook returned empty or invalid response');
  }

  // For new webhook format, return as-is if it has the expected structure
  if (feedback.fixed_typo || feedback.enhanced_version || feedback.fb_details) {
    return feedback;
  }

  // For legacy format, normalize to expected structure
  return {
    title: feedback.title || originalRequest.title || '',
    summary: feedback.summary || '',
    improvedVersion: feedback.improvedVersion || '',
    originalVersion: feedback.originalVersion || originalRequest.content || '',
    vocabSuggestions: Array.isArray(feedback.vocabSuggestions) 
      ? feedback.vocabSuggestions 
      : [],
  };
}

/**
 * Check if error is from AbortController
 */
function isAbortError(error: any): boolean {
  return error.name === 'AbortError' || error.message?.includes('aborted');
}
