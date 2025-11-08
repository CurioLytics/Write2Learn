import { fsrs, Grade } from "ts-fsrs";
import type { Card as FSRSCard } from "ts-fsrs";

export interface WordCard extends FSRSCard {
    word: string;
    meaning: string;
}

const scheduler = fsrs();

export function getNextReview(card: WordCard, grade: Grade): WordCard {
    const now = new Date();
    const { card: updatedCard } = scheduler.next(card, now, grade);

    return {
        ...updatedCard,
        word: card.word,
        meaning: card.meaning
    };
}
