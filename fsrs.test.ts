import { createEmptyCard, formatDate, fsrs, Rating } from "ts-fsrs";

// 1️⃣ Initialize FSRS engine
const f = fsrs(); // default parameters

// 2️⃣ Create a new card
const card = createEmptyCard(new Date("2022-02-01T10:00:00Z"));

// 3️⃣ Set the current review time
const now = new Date("2022-02-10T10:00:00Z");

// 4️⃣ User reviews the card and selects a rating
const userRating = Rating.Easy;

// 5️⃣ Calculate next state for that rating
const nextCardResult = f.next(card, now, userRating);
const updatedCard = nextCardResult.card;

// 6️⃣ Display result
console.log(`⭐ User selected: ${Rating[userRating]}`);
console.log("Next review is due at:", formatDate(updatedCard.due));
console.log("Updated FSRS card:", updatedCard);
