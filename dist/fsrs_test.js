"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fsrsHelper_1 = require("./fsrsHelper");
// card A: brand new
var cardA = {
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
var cardB = {
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
cardA = (0, fsrsHelper_1.getNextReview)(cardA, 3);
cardB = (0, fsrsHelper_1.getNextReview)(cardB, 3);
console.log("Card A (new) next due:", cardA.due);
console.log("Card B (experienced) next due:", cardB.due);
