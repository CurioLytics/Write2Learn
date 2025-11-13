import { NextResponse } from 'next/server';
import { authenticateUser, handleApiError } from '@/utils/api-helpers';
import { profileService } from '@/services/profile-service';

export async function GET() {
  try {
    const user = await authenticateUser();
    const onboardingCompleted = await profileService.checkOnboardingStatus(user.id);
    
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