/**
 * Roleplay utility functions
 */

// Set to true for development debugging
const DEBUG_ROLEPLAY = process.env.NODE_ENV === 'development';

/**
 * Conditional logging for roleplay features
 * Only logs when DEBUG_ROLEPLAY is true (development mode)
 */
export function debugLog(context: string, ...args: any[]) {
  if (DEBUG_ROLEPLAY) {
    console.log(`[Roleplay:${context}]`, ...args);
  }
}

/**
 * Log errors (always logged regardless of debug mode)
 */
export function errorLog(context: string, error: any) {
  console.error(`[Roleplay:${context}]`, error);
}

/**
 * Standard error handler for roleplay services
 * Provides consistent error messages and logging
 */
export function handleServiceError(context: string, error: unknown, fallbackMessage: string): never {
  errorLog(context, error);
  
  if (error instanceof Error) {
    throw new Error(`${fallbackMessage}: ${error.message}`);
  }
  
  throw new Error(fallbackMessage);
}

/**
 * Parse feedback response from various webhook formats
 */
export interface ParsedFeedback {
  clarity: string;
  vocabulary: string;
  grammar: string;
  ideas: string;
  improved_version: string[];
}

export function parseFeedbackResponse(data: any): ParsedFeedback {
  let feedback: any;
  
  // Case 1: [{ output: {...} }]
  if (Array.isArray(data) && data[0]?.output) {
    debugLog('parseFeedbackResponse', 'Matched: Array with output object');
    feedback = data[0].output;
  }
  // Case 2: { output: {...} }
  else if (data?.output) {
    debugLog('parseFeedbackResponse', 'Matched: Object with output property');
    feedback = data.output;
  }
  // Case 3: Direct object with feedback fields
  else if (data?.clarity || data?.vocabulary) {
    debugLog('parseFeedbackResponse', 'Matched: Direct feedback object');
    feedback = data;
  }
  else {
    throw new Error('Invalid feedback response structure');
  }
  
  // Validate required fields
  if (!feedback?.clarity && !feedback?.vocabulary && !feedback?.grammar) {
    throw new Error('Feedback missing required fields');
  }
  
  return feedback;
}
