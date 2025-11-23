// Journal feedback type definitions

export interface JournalFeedbackRequest {
  title?: string;
  content: string;
  userId?: string;
}

export interface GrammarDetail {
  grammar_topic_id: string;
  tags: string[];
  description: string;
}

export interface JournalFeedbackResponse {
  title: string;
  summary: string;
  fixed_typo: string;
  enhanced_version: string;
  grammar_details: GrammarDetail[];
  output: {
    clarity: string;
    vocabulary: string;
    ideas: string;
  };
  // Legacy support
  improvedVersion?: string;
  originalVersion?: string;
  vocabSuggestions?: VocabSuggestion[];
  fb_details?: any[];
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