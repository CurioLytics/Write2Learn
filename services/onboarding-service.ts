import { createServerClient } from '@/services/supabase/server-client';
import type { OnboardingData } from '@/types/onboarding';

export async function saveOnboardingData(userId: string, data: OnboardingData) {
  const supabase = createServerClient();

  const { error } = await supabase
    .from('profiles')
    .update({
      journaling_reasons: data.journaling_reasons,
      journaling_challenges: data.journaling_challenges,
      english_improvement_reasons: data.english_improvement_reasons,
      english_challenges: data.english_challenges,
      english_level: data.english_level,
      daily_review_goal: data.daily_review_goal,
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) {
    console.error('Error saving onboarding data:', error);
    throw new Error('Failed to save onboarding data');
  }

  return { success: true };
}
