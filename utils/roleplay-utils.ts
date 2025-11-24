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

export interface ParsedFeedback {
  clarity: string;
  vocabulary: string;
  grammar: string;
  ideas: string;
  enhanced_version: string[];
}

export function parseFeedbackResponse(data: any): ParsedFeedback {
  if (!Array.isArray(data) || !data[0]?.output) {
    throw new Error('Invalid feedback response structure');
  }
  
  const feedback = data[0].output;
  
  if (!feedback?.clarity || !feedback?.vocabulary || !feedback?.grammar || !feedback?.ideas || !feedback?.enhanced_version) {
    throw new Error('Feedback missing required fields');
  }
  
  return feedback;
}
