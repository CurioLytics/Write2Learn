import { supabase } from '@/services/supabase/client';

/**
 * Simple helper to toggle star status for vocabulary sets
 * Uses direct Supabase client with current user session
 */
export async function toggleVocabularySetStar(setId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data } = await supabase
    .from('vocabulary_set')
    .select('is_starred')
    .eq('id', setId)
    .eq('profile_id', user.id)
    .single();

  const newStarredStatus = !(data as any)?.is_starred;

  await (supabase as any)
    .from('vocabulary_set')
    .update({ is_starred: newStarredStatus })
    .eq('id', setId)
    .eq('profile_id', user.id);

  return newStarredStatus;
}

/**
 * Simple helper to toggle star status for vocabulary words
 * Uses direct Supabase client with current user session
 */
export async function toggleVocabularyStar(wordId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data } = await supabase
    .from('vocabulary')
    .select('is_starred')
    .eq('id', wordId)
    .single();

  const newStarredStatus = !(data as any)?.is_starred;

  await (supabase as any)
    .from('vocabulary')
    .update({ is_starred: newStarredStatus })
    .eq('id', wordId);

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

  // First get all vocabulary sets for this user
  const { data: userSets, error: setsError } = await supabase
    .from('vocabulary_set')
    .select('id')
    .eq('profile_id', user.id);

  if (setsError) {
    throw setsError;
  }

  const setIds = (userSets || []).map(set => set.id);

  if (setIds.length === 0) {
    return [];
  }

  // Then get starred vocabulary from those sets
  const { data, error } = await supabase
    .from('vocabulary')
    .select('id, word, meaning, example, set_id')
    .eq('is_starred', true)
    .in('set_id', setIds);

  if (error) {
    throw error;
  }

  return data || [];
}