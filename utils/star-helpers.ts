import { supabase } from '@/services/supabase/client';

/**
 * Simple helper to toggle star status for vocabulary sets
 * Uses direct Supabase client with current user session
 */
export async function toggleVocabularySetStar(setId: string): Promise<boolean> {
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error('User not authenticated');
  }

  // Get current star status
  const { data: currentData, error: fetchError } = await supabase
    .from('vocabulary_set')
    .select('is_starred')
    .eq('id', setId)
    .eq('profile_id', user.id)
    .single();

  if (fetchError) {
    throw fetchError;
  }

  const newStarredStatus = !currentData.is_starred;

  // Update star status
  const { error: updateError } = await supabase
    .from('vocabulary_set')
    .update({ is_starred: newStarredStatus })
    .eq('id', setId)
    .eq('profile_id', user.id);

  if (updateError) {
    throw updateError;
  }

  return newStarredStatus;
}

/**
 * Simple helper to toggle star status for vocabulary words
 * Uses direct Supabase client with current user session
 */
export async function toggleVocabularyStar(wordId: string): Promise<boolean> {
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error('User not authenticated');
  }

  // Get current star status
  const { data: currentData, error: fetchError } = await supabase
    .from('vocabulary')
    .select('is_starred')
    .eq('id', wordId)
    .single();

  if (fetchError) {
    throw fetchError;
  }

  const newStarredStatus = !currentData.is_starred;

  // Update star status
  const { error: updateError } = await supabase
    .from('vocabulary')
    .update({ is_starred: newStarredStatus })
    .eq('id', wordId);

  if (updateError) {
    throw updateError;
  }

  return newStarredStatus;
}

/**
 * Get all starred vocabulary words for current user
 */
export async function getStarredVocabulary(): Promise<any[]> {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('vocabulary')
    .select(`
      id,
      word,
      meaning,
      example,
      vocabulary_set!inner(profile_id)
    `)
    .eq('is_starred', true)
    .eq('vocabulary_set.profile_id', user.id);

  if (error) {
    throw error;
  }

  return data || [];
}