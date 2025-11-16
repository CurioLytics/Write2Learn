import { createSupabaseClient } from "../../../services/supabase/auth-helpers";
import type { VocabularySet, Vocabulary } from "../types";

// 🧩 Create a client instance
const supabase = createSupabaseClient();

export async function getVocabSets(userId: string): Promise<VocabularySet[]> {
  console.log("📡 [RPC CALL] get_vocabulary_set_stats", { userId });

  // Try the new RPC function first, fallback to old one for compatibility
  let { data, error } = await supabase.rpc("get_vocabulary_set_stats", { user_uuid: userId });
  
  if (error && error.code === 'PGRST202') {
    // Function not found, try legacy function
    console.log("⚠️ [FALLBACK] Using legacy get_flashcard_set_stats");
    const response = await supabase.rpc("get_flashcard_set_stats", { user_uuid: userId });
    data = response.data;
    error = response.error;
  }

  if (error) {
    console.error("❌ [RPC ERROR] get_vocabulary_set_stats", error);
    throw new Error(error.message);
  }

  console.log("✅ [RPC SUCCESS] get_vocabulary_set_stats", data);
  return data || [];
}

export async function getVocabularyForReview(
  userId: string,
  setId: string
): Promise<Vocabulary[]> {
  console.log("📡 [RPC CALL] get_vocabulary_for_review", { userId, setId });

  // Try the new RPC function first, fallback to old one for compatibility
  let { data, error } = await supabase.rpc("get_vocabulary_for_review", {
    user_uuid: userId,
    set_uuid: setId,
  });

  if (error && error.code === 'PGRST202') {
    // Function not found, try legacy function
    console.log("⚠️ [FALLBACK] Using legacy get_flashcards_for_review");
    const response = await supabase.rpc("get_flashcards_for_review", {
      user_uuid: userId,
      set_uuid: setId,
    });
    data = response.data;
    error = response.error;
  }

  if (error) {
    console.error("❌ [RPC ERROR] get_vocabulary_for_review", error);
    throw new Error(error.message);
  }

  console.log("✅ [RPC SUCCESS] get_vocabulary_for_review", data);
  return data || [];
}

export async function updateVocabularyReview(params: any) {
  console.log("📡 [RPC CALL] update_vocabulary_review", params);

  // Try the new RPC function first, fallback to old one for compatibility
  let { data, error } = await supabase.rpc("update_vocabulary_review", params);

  if (error && error.code === 'PGRST202') {
    // Function not found, try legacy function
    console.log("⚠️ [FALLBACK] Using legacy update_flashcard_review");
    const response = await supabase.rpc("update_flashcard_review", params);
    data = response.data;
    error = response.error;
  }

  if (error) {
    console.error("❌ [RPC ERROR] update_vocabulary_review", error);
    throw new Error(error.message);
  }

  console.log("✅ [RPC SUCCESS] update_vocabulary_review", data);
  return data;
}

// Legacy aliases for backward compatibility
export const getFlashcardsForReview = getVocabularyForReview;
export const updateFlashcardReview = updateVocabularyReview;
