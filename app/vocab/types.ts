export interface FlashcardSet {
  set_id: string;
  title: string;
  total_flashcards: number;
  flashcards_due: number;
}

export interface Flashcard {
  flashcard_id: string;
  word: string;
  meaning: string;
  example?: string;
  next_review_at?: string;
  ease_factor?: number;
  interval?: number;
  state?: string;
}
