import { getNextReview, WordCard } from "./fsrsHelper";

// card A: brand new
let cardA: WordCard = {
  word: "apple",
  meaning: "a fruit",
  due: new Date(),
  stability: 0,
  difficulty: 0.3,
  elapsed_days: 0,
  scheduled_days: 0,
  learning_steps: 0,
  reps: 0,
  lapses: 0,
  state: 0,
  last_review: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
};

// card B: experienced card
let cardB: WordCard = {
  word: "banana",
  meaning: "a fruit",
  due: new Date(),
  stability: 3.5,
  difficulty: 0.25,
  elapsed_days: 10,
  scheduled_days: 10,
  learning_steps: 0,
  reps: 5,
  lapses: 0,
  state: 2,
  last_review: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
};

// User rates both as "Good" (3)
cardA = getNextReview(cardA, 3);
cardB = getNextReview(cardB, 3);

console.log("Card A (new) next due:", cardA.due);
console.log("Card B (experienced) next due:", cardB.due);
