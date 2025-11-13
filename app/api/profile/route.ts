import { NextResponse } from 'next/server';
import type { UserProfile } from '@/types/onboarding';
import { authenticateUser, handleApiError, parseRequestBody, createSuccessResponse } from '@/utils/api-helpers';
import { profileService } from '@/services/profile-service';

// Use a simple in-memory cache to prevent duplicate profile updates in a short time period
const PROFILE_UPDATE_CACHE = new Map<string, number>();
const CACHE_TTL = 10000; // 10 seconds

export async function POST(request: Request) {
  try {
    const profile: Partial<UserProfile> = await parseRequestBody(request);
    
    // Try to authenticate user, but don't fail if not authenticated
    // This allows saving profile data before user completes registration
    let user;
    try {
      user = await authenticateUser();
    } catch {
      return NextResponse.json({ 
        success: true, 
        message: 'Profile data received but not saved - user not authenticated' 
      });
    }

    // Check for recent duplicate requests
    const cacheKey = `${user.id}-${JSON.stringify(profile)}`;
    const lastUpdate = PROFILE_UPDATE_CACHE.get(cacheKey);
    const now = Date.now();
    
    if (lastUpdate && now - lastUpdate < CACHE_TTL) {
      console.log('Duplicate profile update detected, using cached response');
      return NextResponse.json({ 
        success: true,
        profile: {
          id: user.id,
          ...profile,
          onboardingCompleted: true,
        },
        cached: true
      });
    }
    
    // Update cache timestamp
    PROFILE_UPDATE_CACHE.set(cacheKey, now);
    
    // Clean up old cache entries
    if (PROFILE_UPDATE_CACHE.size > 100) {
      const oldestKey = Array.from(PROFILE_UPDATE_CACHE.keys())[0];
      PROFILE_UPDATE_CACHE.delete(oldestKey);
    }

    const updatedProfile = await profileService.updateProfile(user.id, user.email || '', profile);
    
    return createSuccessResponse({ 
      profile: updatedProfile,
      webhook: 'processing_async'
    });
  } catch (error) {
    return handleApiError(error);
  }
}