import { DateRange, DatePreset } from '@/types/dashboard';

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
}

export function timeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + ' years ago';
  
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + ' months ago';
  
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + ' days ago';
  
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + ' hours ago';
  
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + ' minutes ago';
  
  return Math.floor(seconds) + ' seconds ago';
}

/**
 * Format distance to now in a human-readable format (e.g., "3 days ago")
 * This function is a wrapper around timeAgo for consistent API naming
 * @param date - The date to calculate the distance from
 * @returns A string representing the time distance in a human-readable format
 */
export function formatDistanceToNow(date: Date): string {
  return timeAgo(date);
}

/**
 * Formats a Date object to YYYY-MM-DD format for input[type="date"] fields
 * @param date - The date to format
 * @returns A string in YYYY-MM-DD format
 */
export function formatDateInput(date: Date): string {
  // Format to YYYY-MM-DD which is required for input[type="date"]
  return date.toISOString().split('T')[0];
}

/**
 * Parses a date string from input[type="date"] and returns a Date object
 * @param dateString - The date string in YYYY-MM-DD format
 * @returns A Date object or null if the date is invalid
 */
export function parseDateInput(dateString: string): Date | null {
  if (!dateString) return null;
  
  const date = new Date(dateString);
  // Check if date is valid
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Get date range based on preset
 */
export function getDateRangeFromPreset(preset: DatePreset): DateRange | null {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (preset) {
    case 'this-week': {
      // Start from Monday of current week
      const startOfWeek = new Date(today);
      const dayOfWeek = startOfWeek.getDay(); // 0 = Sunday
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Monday offset
      startOfWeek.setDate(startOfWeek.getDate() + mondayOffset);
      
      // End of Sunday of current week
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      
      return {
        from: startOfWeek.toISOString(),
        to: endOfWeek.toISOString(),
      };
    }
    
    case '7-days': {
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 7);
      
      const endOfToday = new Date(today);
      endOfToday.setHours(23, 59, 59, 999);
      
      return {
        from: sevenDaysAgo.toISOString(),
        to: endOfToday.toISOString(),
      };
    }
    
    case '30-days': {
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);
      
      const endOfToday = new Date(today);
      endOfToday.setHours(23, 59, 59, 999);
      
      return {
        from: thirtyDaysAgo.toISOString(),
        to: endOfToday.toISOString(),
      };
    }
    
    case '3-months': {
      const threeMonthsAgo = new Date(today);
      threeMonthsAgo.setMonth(today.getMonth() - 3);
      
      const endOfToday = new Date(today);
      endOfToday.setHours(23, 59, 59, 999);
      
      return {
        from: threeMonthsAgo.toISOString(),
        to: endOfToday.toISOString(),
      };
    }
    
    case 'all-time':
      return null; // No date filter
      
    default:
      return null;
  }
}

/**
 * Format date range for display
 */
export function formatDateRange(dateRange: DateRange | null): string {
  if (!dateRange) return 'Tất cả thời gian';
  
  const from = new Date(dateRange.from);
  const to = new Date(dateRange.to);
  
  return `${from.toLocaleDateString('vi-VN')} - ${to.toLocaleDateString('vi-VN')}`;
}

/**
 * Get preset label for UI display
 */
export function getPresetLabel(preset: DatePreset): string {
  switch (preset) {
    case 'this-week':
      return 'Tuần này';
    case '7-days':
      return '7 ngày qua';
    case '30-days':
      return '30 ngày qua';
    case '3-months':
      return '3 tháng qua';
    case 'all-time':
      return 'Tất cả thời gian';
    default:
      return 'Không xác định';
  }
}