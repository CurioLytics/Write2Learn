/**
 * Interface for vocabulary word definition and example content
 */
export interface VocabularyContent {
  definition: string;
  example: string;
  synonyms?: string[];
}

/**
 * Interface for individual vocabulary word data
 */
export interface Vocabulary {
  id?: string;
  set_id: string;
  word: string;
  meaning: string;
  created_at?: string;
  example?: string;
  source_id?: string;
  updated_at?: string;
}

/**
 * Interface for vocabulary set statistics
 */
export interface VocabularySetStats {
  set_id: string;
  set_title: string;
  total_vocabulary: number;
  vocabulary_due: number;
}

/**
 * Interface for vocabulary set data
 */
export interface VocabularySet {
  id?: string;
  title: string;
  created_at?: string;
  profile_id: string;
  description?: string;
  is_default?: boolean;
  updated_at?: string;
}

/**
 * Interface for vocabulary status (FSRS learning data)
 */
export interface VocabularyStatus {
  id?: string;
  vocabulary_id: string;
  interval: number;
  repetitions: number;
  ease_factor: number;
  next_review_at?: string;
  last_review_at?: string;
  stability?: number;
  difficulty?: number;
  elapsed_days?: number;
  scheduled_days?: number;
  learning_steps?: number;
  lapses?: number;
  state?: 'new' | 'learning' | 'review' | 'relearning';
  updated_at?: string;
}

/**
 * Interface for the vocabulary webhook response format
 */
export interface VocabularyWebhookResponse {
  output: Vocabulary[];
}

/**
 * Complete vocabulary webhook response (array of response items)
 */
export type VocabularyWebhookResponseArray = VocabularyWebhookResponse[];

/**
 * Legacy flashcard interfaces for backward compatibility
 * @deprecated Use Vocabulary interfaces instead
 */
export interface FlashcardBack {
  definition: string;
  example: string;
  synonyms?: string[];
}

export interface Flashcard {
  word: string;
  back: FlashcardBack;
}

export interface FlashcardWebhookResponse {
  output: Flashcard[];
}

export type FlashcardWebhookResponseArray = FlashcardWebhookResponse[];