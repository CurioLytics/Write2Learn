import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, handleApiError, createSuccessResponse } from '@/utils/api-helpers';
import { analyticsService } from '@/services/analytics-service';

/**
 * GET /api/analytics/monthly-goals
 * Get daily goal completion status for an entire month (for calendar view)
 * 
 * Query params:
 * - month: ISO date string for any day in the target month (default: current month)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await authenticateUser();
    
    const searchParams = request.nextUrl.searchParams;
    const monthParam = searchParams.get('month');
    
    // Default to current month
    const month = monthParam ? new Date(monthParam) : new Date();
    
    const goalStatuses = await analyticsService.getMonthlyGoalStatuses(user.id, month);
    
    // Convert Map to Object for JSON serialization
    const goalStatusesObject = Object.fromEntries(goalStatuses);

    return createSuccessResponse({ goalStatuses: goalStatusesObject });
  } catch (error) {
    return handleApiError(error);
  }
}
