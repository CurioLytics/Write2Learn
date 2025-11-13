import { createSupabaseClient } from '@/services/supabase/auth-helpers';
import { UserProfile } from '@/types/onboarding';
import { sendWebhook } from '@/utils/webhook';

/**
 * Service for managing user profiles
 */
class ProfileService {
  /**
   * Check if user has completed onboarding
   */
  async checkOnboardingStatus(userId: string): Promise<boolean> {
    try {
      const supabase = createSupabaseClient();
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error checking onboarding status:', error);
        throw error;
      }

      return Boolean(profile?.onboarding_completed);
    } catch (error) {
      console.error('Error in checkOnboardingStatus:', error);
      throw error;
    }
  }

  /**
   * Update or create user profile
   */
  async updateProfile(userId: string, userEmail: string, profile: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const supabase = createSupabaseClient();
      
      console.log('Updating profile for user:', userId, profile);
      
      const { data: savedProfile, error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          name: profile.name,
          english_level: profile.englishLevel,
          goals: profile.goals,
          writing_types: profile.writingTypes,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        throw error;
      }

      if (!savedProfile) {
        throw new Error('Failed to save profile');
      }

      // Send webhook with profile data
      const timestamp = new Date().toISOString();
      const webhookData = {
        userId: userId,
        email: userEmail,
        ...profile,
        onboardingCompleted: true,
        timestamp,
        requestId: `${userId}-${timestamp}`
      };

      // Send webhook asynchronously
      sendWebhook(webhookData).catch(error => 
        console.error('Webhook send error:', error)
      );

      return {
        id: savedProfile.id,
        name: savedProfile.name,
        englishLevel: savedProfile.english_level,
        goals: savedProfile.goals,
        writingTypes: savedProfile.writing_types,
        onboardingCompleted: savedProfile.onboarding_completed
      };
    } catch (error) {
      console.error('Error in updateProfile:', error);
      throw error;
    }
  }
}

export const profileService = new ProfileService();