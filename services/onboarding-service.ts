import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { OnboardingData } from '@/types/onboarding';

export async function saveOnboardingData(userId: string, data: OnboardingData) {
  const supabase = createRouteHandlerClient({ cookies });

  // Update profile
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      name: data.name,
      english_improvement_reasons: data.english_improvement_reasons,
      english_challenges: data.english_challenges,
      english_level: data.english_level,
      style: data.english_tone,
      daily_review_goal: data.daily_review_goal,
      daily_vocab_goal: data.daily_vocab_goal,
      daily_journal_goal: data.daily_journal_goal,
      daily_roleplay_goal: data.daily_roleplay_goal,
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (profileError) throw new Error('Failed to save onboarding data');

  // Create default templates
  const templates = [
    {
      profile_id: userId,
      name: 'Morning Intentions',
      content: 'What is on your mind right now that you need to clear before you start the day?\n\n\nWhat is the one thing you want to get done today, and why?\n\n\nWhat is the emotional state or mindset you want to embody today?',
      cover_image: 'https://eqhldzwiymtcyxyxezos.supabase.co/storage/v1/object/public/w2l/morning.jpg',
      default: true
    },
    {
      profile_id: userId,
      name: 'Evening Wind-Down',
      content: 'What is your one win from the day?\n\n\nWhat is your one point of tension, anxiety, or stress from the day?\n\n\nWhat is your one point of gratitude from the day?',
      cover_image: 'https://eqhldzwiymtcyxyxezos.supabase.co/storage/v1/object/public/w2l/evening.jpg',
      default: true
    }
  ];

  const { error: templatesError } = await supabase.from('templates').insert(templates);
  if (templatesError) console.error('Failed to create templates:', templatesError);

  // Create default vocabulary set
  const { error: vocabError } = await supabase.from('vocabulary_set').insert({
    title: 'Default Set',
    profile_id: userId,
    is_default: true
  });
  
  if (vocabError) console.error('Failed to create vocabulary set:', vocabError);

  return { success: true };
}
