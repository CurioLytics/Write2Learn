"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fsrsHelper_1 = require("./fsrsHelper");
var wordCard = {
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
    last_review: undefined
};
// User selects "Good"
wordCard = (0, fsrsHelper_1.getNextReview)(wordCard, 2);
console.log("Next review due at:", wordCard.due);
console.log("Word:", wordCard.word);
