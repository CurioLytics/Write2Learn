// Journal feedback type definitions

export interface JournalFeedbackRequest {
  title?: string;
  content: string;
  userId?: string;
}

export interface JournalFeedbackResponse {
  title: string;
  summary: string;
  improvedVersion: string;
  originalVersion: string;
  vocabSuggestions: VocabSuggestion[];
}

export interface VocabSuggestion {
  word: string;
  meaning: string;
  example?: string;
}

// Webhook response types
export interface WebhookFeedbackResponse {
  title?: string;
  summary?: string;
  improvedVersion?: string;
  originalVersion?: string;
  vocabSuggestions?: Array<{
    word?: string;
    term?: string;
    meaning?: string;
    definition?: string;
    example?: string;
  }>;
}

export interface WebhookResponse {
  output?: WebhookFeedbackResponse;
  // Support both direct response and array wrapper
  [key: string]: any;
}

export interface ServiceError {
  type: 'NETWORK_ERROR' | 'VALIDATION_ERROR' | 'WEBHOOK_ERROR' | 'TIMEOUT_ERROR';
  message: string;
  originalError?: Error;
}

export interface FeedbackServiceResult {
  success: boolean;
  data?: JournalFeedbackResponse;
  error?: ServiceError;
}