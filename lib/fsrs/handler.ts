import { fsrs, Rating } from "ts-fsrs";
import { db } from "../database/db"; // your singleton client

const scheduler = fsrs();

/**
 * Handles a user review for a given vocabulary word.
 * Fetches, updates, and logs using Supabase.
 */
export async function handleReview(vocabulary_id: string, ratingValue: number) {
  // 1️⃣ Fetch current status
  const { data: status, error: fetchError } = await db
    .from("vocabulary_status")
    .select("*")
    .eq("vocabulary_id", vocabulary_id)
    .single();

  if (fetchError || !status) throw new Error("Vocabulary status not found");

  // 2️⃣ Build FSRS card object
  const card = {
    due: new Date(status.next_review_at || Date.now()),
    stability: status.stability ?? 0,
    difficulty: status.difficulty ?? 0.3,
    elapsed_days: status.elapsed_days ?? 0,
    scheduled_days: status.scheduled_days ?? 0,
    learning_steps: status.learning_steps ?? 0,
    reps: status.repetitions ?? 0,
    lapses: status.lapses ?? 0,
    state: mapState(status.state),
    last_review: status.last_review_at ? new Date(status.last_review_at) : new Date(),
  };

  // 3️⃣ Run FSRS algorithm
  const now = new Date();
  const rating = mapRating(ratingValue);
  const { card: updated, log } = scheduler.next(card, now, rating);

  // 4️⃣ Update vocabulary_status
  const { error: updateError } = await db
    .from("vocabulary_status")
    .update({
      next_review_at: updated.due.toISOString(),
      stability: updated.stability,
      difficulty: updated.difficulty,
      elapsed_days: updated.elapsed_days,
      scheduled_days: updated.scheduled_days,
      learning_steps: updated.learning_steps,
      repetitions: updated.reps,
      lapses: updated.lapses,
      state: reverseMapState(updated.state),
      last_review_at: now.toISOString(),
      updated_at: now.toISOString(),
    })
    .eq("vocabulary_id", vocabulary_id);

  if (updateError) throw updateError;

  // 5️⃣ Insert review log
  const { error: logError } = await db
    .from("fsrs_review_logs")
    .insert({
      card_id: status.id,
      rating: Rating[rating].toLocaleLowerCase(),
      state: status.state,
      review_date: now.toISOString(),
      elapsed_days: log.elapsed_days,
      scheduled_days: log.scheduled_days,
      stability_before: log.stability,
      difficulty_before: log.difficulty,
      created_at: now.toISOString(),
    });

  if (logError) throw logError;

  // ✅ Return summary
  return {
    vocabulary_id,
    next_review_at: updated.due,
    stability: updated.stability,
    difficulty: updated.difficulty,
  };
}

/** 🔸 Map DB state (string) to FSRS state (number) */
function mapState(state: string | null) {
  switch (state) {
    case "new": return 0;
    case "learning": return 1;
    case "review": return 2;
    case "relearning": return 3;
    default: return 0;
  }
}

/** 🔸 Map FSRS state (number) back to DB string */
function reverseMapState(state: number) {
  return ["new", "learning", "review", "relearning"][state] ?? "new";
}

/** 🔸 Convert user rating (1–4) to FSRS Rating enum */
function mapRating(value: number) {
  switch (value) {
    case 1: return Rating.Again;
    case 2: return Rating.Hard;
    case 3: return Rating.Good;
    case 4: return Rating.Easy;
    default: throw new Error("Invalid rating");
  }
}
