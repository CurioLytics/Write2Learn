import { NextRequest, NextResponse } from 'next/server';

interface JournalFeedbackRequest {
  title?: string;
  content: string;
  userId?: string;
}

interface JournalFeedbackResponse {
  title: string;
  summary: string;
  improvedVersion: string;
  originalVersion: string;
  vocabSuggestions: string[];
}

/**
 * Default feedback response for when the service is unavailable
 */
const createDefaultFeedback = (request: JournalFeedbackRequest): JournalFeedbackResponse => ({
  title: request.title || 'Journal Entry',
  summary: "We couldn't generate a detailed summary for your journal entry at this time.",
  improvedVersion: request.content,
  originalVersion: request.content,
  vocabSuggestions: [],
});

/**
 * Configuration for the feedback service
 */
const FEEDBACK_CONFIG = {
  TIMEOUT_MS: 30000,
  MAX_RETRIES: 1,
  WEBHOOK_URL: process.env.NEXT_PUBLIC_GET_FEEDBACK_WEBHOOK_URL,
} as const;

/**
 * Improved journal feedback API route with better error handling,
 * timeout management, and response normalization
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
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
      console.warn('Journal feedback webhook URL not configured');
      return NextResponse.json(
        createDefaultFeedback(body),
        { status: 200 }
      );
    }

    // Make the request with timeout and proper error handling
    const feedback = await requestFeedbackWithRetry(body);
    
    return NextResponse.json(feedback, { status: 200 });
    
  } catch (error) {
    console.error('Journal feedback API error:', error);
    
    // Try to extract the body for fallback response
    let fallbackBody: JournalFeedbackRequest;
    try {
      fallbackBody = await req.json();
    } catch {
      fallbackBody = { content: '', title: 'Journal Entry' };
    }
    
    return NextResponse.json(
      createDefaultFeedback(fallbackBody),
      { status: 200 } // Return 200 to not break the UI
    );
  }
}

/**
 * Make feedback request with retry logic
 */
async function requestFeedbackWithRetry(
  body: JournalFeedbackRequest,
  retryCount = 0
): Promise<JournalFeedbackResponse> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FEEDBACK_CONFIG.TIMEOUT_MS);

    const response = await fetch(FEEDBACK_CONFIG.WEBHOOK_URL!, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'User-Agent': 'journal-feedback/1.0'
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Webhook responded with status: ${response.status}`);
    }

    const data = await response.json();
    return normalizeFeedbackResponse(data, body);
    
  } catch (error) {
    console.error(`Feedback request failed (attempt ${retryCount + 1}):`, error);
    
    // Retry once if it's the first attempt and not an abort error
    if (retryCount < FEEDBACK_CONFIG.MAX_RETRIES && !isAbortError(error)) {
      return requestFeedbackWithRetry(body, retryCount + 1);
    }
    
    // Return default feedback on final failure
    return createDefaultFeedback(body);
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
  const feedback = Array.isArray(data) && data[0]?.output
    ? data[0].output
    : data.output
    ? data.output
    : data;

  return {
    title: feedback?.title || originalRequest.title || 'Journal Entry',
    summary: feedback?.summary || "We couldn't generate a detailed summary for your journal entry at this time.",
    improvedVersion: feedback?.improvedVersion || originalRequest.content,
    originalVersion: feedback?.originalVersion || originalRequest.content,
    vocabSuggestions: Array.isArray(feedback?.vocabSuggestions) 
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
