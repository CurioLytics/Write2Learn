import { NextResponse } from 'next/server';
import { authenticateUser, handleApiError } from '@/utils/api-helpers';
import { createSupabaseClient } from '@/services/supabase/auth-helpers';

export async function GET() {
  try {
    const user = await authenticateUser();
    const supabase = createSupabaseClient();
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error checking onboarding status:', error);
      throw error;
    }
    
    const onboardingCompleted = Boolean(profile?.onboarding_completed);
    
    return NextResponse.json(
      { onboardingCompleted },
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}