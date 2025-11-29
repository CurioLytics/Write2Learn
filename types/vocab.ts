export type VocabLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface VocabWord {
  id: string;
  word: string;
  definition: string;
  example: string;
  level: VocabLevel;
  createdAt: Date;
  userId: string;
}

/**
 * Represents a collection of vocabulary words grouped by a topic or theme
 */
export interface VocabCollection {
  id: string;
  title: string;
  description: string;
  type: 'role-play' | 'journal' | 'topic' | 'chat' | 'theme';
  wordsCount: number;
  masteredCount: number;
  dueCount?: number; // Number of words due for review
  userId: string;
  createdAt: Date;
}

/**
 * Represents a vocabulary set as returned by the Supabase function
 */
export type VocabularySet = {
  id: string;                // required for navigation
  title: string;             // name or title of the set
  description: string | null;
  created_at: string;
};

/**
 * Legacy flashcard set interface for backward compatibility
 * @deprecated Use VocabularySet instead
 */
export type FlashcardSet = VocabularySet;

/**
 * Statistics for a vocabulary collection
 */
export interface VocabStats {
  total: number;
  mastered: number;
}

/**
 * Categorized vocabulary data for display on the vocab hub page
 */
export interface VocabHubData {
  collections: VocabCollection[];
  vocabularySets?: VocabularySet[];
  flashcardSets?: FlashcardSet[]; // Legacy alias
}