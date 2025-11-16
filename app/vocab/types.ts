export interface VocabularySet {
  set_id: string;
  title: string;
  total_vocabulary: number;
  vocabulary_due: number;
}

export interface Vocabulary {
  vocabulary_id: string;
  word: string;
  meaning: string;
  example?: string;
  next_review_at?: string;
  ease_factor?: number;
  interval?: number;
  state?: string;
}

// Legacy aliases for backward compatibility
export interface FlashcardSet extends VocabularySet {
  total_flashcards: number;
  flashcards_due: number;
}

export interface Flashcard extends Vocabulary {
  flashcard_id: string;
}
