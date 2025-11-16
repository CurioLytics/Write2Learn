export type VocabularySetStats = {
  set_id: string;
  title: string;
  total_vocabulary: number;
  vocabulary_due: number;
};

/**
 * Legacy flashcard set stats interface for backward compatibility
 * @deprecated Use VocabularySetStats instead
 */
export type FlashcardSetStats = {
  set_id: string;
  title: string;
  total_flashcards: number;
  flashcards_due: number;
};
