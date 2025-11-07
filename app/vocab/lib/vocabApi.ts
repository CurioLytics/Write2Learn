import { createSupabaseClient } from "../../../services/supabase/auth-helpers";
import type { FlashcardSet, Flashcard } from "../types";

// 🧩 Create a client instance
const supabase = createSupabaseClient();

export async function getVocabSets(userId: string): Promise<FlashcardSet[]> {
  console.log("📡 [RPC CALL] get_flashcard_set_stats", { userId });

  const { data, error } = await supabase.rpc("get_flashcard_set_stats", { user_uuid: userId });

  if (error) {
    console.error("❌ [RPC ERROR] get_flashcard_set_stats", error);
    throw new Error(error.message);
  }

  console.log("✅ [RPC SUCCESS] get_flashcard_set_stats", data);
  return data || [];
}

export async function getFlashcardsForReview(
  userId: string,
  setId: string
): Promise<Flashcard[]> {
  console.log("📡 [RPC CALL] get_flashcards_for_review", { userId, setId });

  const { data, error } = await supabase.rpc("get_flashcards_for_review", {
    user_uuid: userId,
    set_uuid: setId,
  });

  if (error) {
    console.error("❌ [RPC ERROR] get_flashcards_for_review", error);
    throw new Error(error.message);
  }

  console.log("✅ [RPC SUCCESS] get_flashcards_for_review", data);
  return data || [];
}

export async function updateFlashcardReview(params: any) {
  console.log("📡 [RPC CALL] update_flashcard_review", params);

  const { data, error } = await supabase.rpc("update_flashcard_review", params);

  if (error) {
    console.error("❌ [RPC ERROR] update_flashcard_review", error);
    throw new Error(error.message);
  }

  console.log("✅ [RPC SUCCESS] update_flashcard_review", data);
  return data;
}
