import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/database.types';
import type { SupabaseClient } from '@supabase/supabase-js';

type LearningEventType = Database['public']['Tables']['learning_events']['Row']['event_type'];
type GrammarFeedbackView = Database['public']['Views']['grammar_feedback_view']['Row'];

export interface DailyGoalStatus {
  date: string;
  vocab_created: {
    completed: number;
    target: number;
  };
  journal_created: {
    completed: number;
    target: number;
  };
  roleplay_completed: {
    completed: number;
    target: number;
  };
}

export interface WeeklyActivityData {
  date: string;
  vocab_created: number;
  vocab_reviewed: number;
  journal_created: number;
  roleplay_completed: number;
}

export interface GrammarErrorSummary {
  topic_name: string;
  topic_id: string | null;
  topic_level: string | null;
  error_count: number;
  recent_errors: string[];
}

export interface StreakData {
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
}

export interface AnalyticsSummary {
  dailyGoal: DailyGoalStatus;
  weeklyActivity: WeeklyActivityData[];
  grammarErrors: GrammarErrorSummary[];
  streak: StreakData;
}

/**
 * Service for Progress page analytics
 * Provides aggregated data from learning_events and grammar_feedback_view
 */
export class AnalyticsService {
  /**
   * Create a server-side Supabase client with proper auth context
   */
  private getSupabaseClient() {
    return createRouteHandlerClient<Database>({ cookies });
  }

  /**
   * Get today's goal completion status
   */
  async getDailyGoalStatus(profileId: string, date?: Date): Promise<DailyGoalStatus> {
    try {
      const supabase = this.getSupabaseClient();
      const targetDate = date || new Date();
      
      // Use UTC timezone to avoid timezone issues
      const startOfDay = new Date(Date.UTC(
        targetDate.getUTCFullYear(),
        targetDate.getUTCMonth(),
        targetDate.getUTCDate(),
        0, 0, 0, 0
      ));
      const endOfDay = new Date(Date.UTC(
        targetDate.getUTCFullYear(),
        targetDate.getUTCMonth(),
        targetDate.getUTCDate(),
        23, 59, 59, 999
      ));

      console.log('[getDailyGoalStatus] Date range:', {
        targetDate: targetDate.toISOString(),
        startOfDay: startOfDay.toISOString(),
        endOfDay: endOfDay.toISOString(),
        profileId
      });

      // Fetch user's goal settings from profile and today's events in parallel
      const [profileResult, eventsResult] = await Promise.all([
        (supabase as any)
          .from('profiles')
          .select('daily_review_goal, daily_roleplay_goal, daily_journal_goal')
          .eq('id', profileId)
          .maybeSingle(),
        (supabase as any)
          .from('learning_events')
          .select('event_type')
          .eq('profile_id', profileId)
          .gte('created_at', startOfDay.toISOString())
          .lte('created_at', endOfDay.toISOString())
          .neq('event_type', 'session_active')
      ]);

      if (profileResult.error) throw profileResult.error;
      if (eventsResult.error) throw eventsResult.error;

      const profile = profileResult.data;
      const events = eventsResult.data;

      console.log('[getDailyGoalStatus] Profile goals:', profile);
      console.log('[getDailyGoalStatus] Events found:', events?.length, events);

      // Count each event type
      const eventCounts = (events as any)?.reduce((acc: any, e: any) => {
        acc[e.event_type] = (acc[e.event_type] || 0) + 1;
        return acc;
      }, {}) || {};

      console.log('[getDailyGoalStatus] Event counts:', eventCounts);

      return {
        date: targetDate.toISOString().split('T')[0],
        vocab_created: {
          completed: eventCounts['vocab_created'] || 0,
          target: profile?.daily_review_goal || 10, // default 10 if not set
        },
        journal_created: {
          completed: eventCounts['journal_created'] || 0,
          target: profile?.daily_journal_goal || 1, // default 1 if not set
        },
        roleplay_completed: {
          completed: eventCounts['roleplay_completed'] || 0,
          target: profile?.daily_roleplay_goal || 1, // default 1 if not set
        },
      };
    } catch (error) {
      console.error('Error fetching daily goal status:', error);
      return {
        date: (date || new Date()).toISOString().split('T')[0],
        vocab_created: { completed: 0, target: 10 },
        journal_created: { completed: 0, target: 1 },
        roleplay_completed: { completed: 0, target: 1 },
      };
    }
  }

  /**
   * Get weekly activity data (7 days by default)
   */
  async getWeeklyActivity(
    profileId: string,
    startDate: Date,
    endDate: Date
  ): Promise<WeeklyActivityData[]> {
    try {
      const supabase = this.getSupabaseClient();
      const { data, error } = await (supabase as any)
        .from('learning_events')
        .select('event_type, created_at')
        .eq('profile_id', profileId)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .neq('event_type', 'session_active')
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Group by date and event type
      const activityMap = new Map<string, WeeklyActivityData>();

      // Initialize all dates in range with zero counts
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const dateKey = currentDate.toISOString().split('T')[0];
        activityMap.set(dateKey, {
          date: dateKey,
          vocab_created: 0,
          vocab_reviewed: 0,
          journal_created: 0,
          roleplay_completed: 0,
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Count events per day
      (data as any)?.forEach((event: any) => {
        const dateKey = new Date(event.created_at).toISOString().split('T')[0];
        const dayData = activityMap.get(dateKey);
        if (dayData && event.event_type !== 'session_active') {
          (dayData as any)[event.event_type]++;
        }
      });

      return Array.from(activityMap.values()).sort((a, b) => a.date.localeCompare(b.date));
    } catch (error) {
      console.error('Error fetching weekly activity:', error);
      return [];
    }
  }

  /**
   * Get grammar error summary grouped by topic
   */
  async getGrammarErrorSummary(
    profileId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<GrammarErrorSummary[]> {
    try {
      const supabase = this.getSupabaseClient();
      let query = (supabase as any)
        .from('grammar_feedback_view')
        .select('*')
        .eq('profile_id', profileId)
        .not('topic_name', 'is', null)
        .order('created_at', { ascending: false });

      if (startDate) {
        query = query.gte('created_at', startDate.toISOString());
      }
      if (endDate) {
        query = query.lte('created_at', endDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      // Group by topic and aggregate
      const topicMap = new Map<string, {
        topic_id: string | null;
        topic_level: string | null;
        errors: string[];
      }>();

      data?.forEach((item: any) => {
        if (!item.topic_name) return;

        if (!topicMap.has(item.topic_name)) {
          topicMap.set(item.topic_name, {
            topic_id: item.grammar_topic_id || null,
            topic_level: item.topic_level,
            errors: [],
          });
        }

        const topicData = topicMap.get(item.topic_name)!;
        if (item.error_description && topicData.errors.length < 5) {
          topicData.errors.push(item.error_description);
        }
      });

      // Convert to array and sort by error count
      return Array.from(topicMap.entries())
        .map(([topic_name, data]) => ({
          topic_name,
          topic_id: data.topic_id,
          topic_level: data.topic_level,
          error_count: data.errors.length,
          recent_errors: data.errors,
        }))
        .sort((a, b) => b.error_count - a.error_count);
    } catch (error) {
      console.error('Error fetching grammar error summary:', error);
      return [];
    }
  }

  /**
   * Calculate streak based on session_active events
   */
  async getStreak(profileId: string): Promise<StreakData> {
    try {
      const supabase = this.getSupabaseClient();
      const { data, error } = await (supabase as any)
        .from('learning_events')
        .select('created_at')
        .eq('profile_id', profileId)
        .eq('event_type', 'session_active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        return { current_streak: 0, longest_streak: 0, last_active_date: null };
      }

      // Get unique dates (sorted descending)
      const uniqueDates: string[] = Array.from(
        new Set((data as any).map((e: any) => new Date(e.created_at).toISOString().split('T')[0]))
      ).sort((a: any, b: any) => b.localeCompare(a)) as string[];

      // Calculate current streak
      let currentStreak = 0;
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      // Start counting only if last activity was today or yesterday
      if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
        currentStreak = 1;
        let expectedDate = new Date(uniqueDates[0]);
        
        for (let i = 1; i < uniqueDates.length; i++) {
          expectedDate.setDate(expectedDate.getDate() - 1);
          const expectedDateStr = expectedDate.toISOString().split('T')[0];
          
          if (uniqueDates[i] === expectedDateStr) {
            currentStreak++;
          } else {
            break;
          }
        }
      }

      // Calculate longest streak
      let longestStreak = 0;
      let tempStreak = 1;

      for (let i = 1; i < uniqueDates.length; i++) {
        const prevDate = new Date(uniqueDates[i - 1]);
        const currDate = new Date(uniqueDates[i]);
        const diffDays = Math.floor((prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

      return {
        current_streak: currentStreak,
        longest_streak: longestStreak,
        last_active_date: (data[0] as any).created_at,
      };
    } catch (error) {
      console.error('Error calculating streak:', error);
      return { current_streak: 0, longest_streak: 0, last_active_date: null };
    }
  }

  /**
   * Get daily goal statuses for a month (for calendar view)
   */
  async getMonthlyGoalStatuses(
    profileId: string,
    month: Date
  ): Promise<Map<string, DailyGoalStatus>> {
    try {
      const supabase = this.getSupabaseClient();
      
      // Get start and end of month in UTC
      const startOfMonth = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth(), 1, 0, 0, 0, 0));
      const endOfMonth = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + 1, 0, 23, 59, 59, 999));

      console.log('[getMonthlyGoalStatuses] Fetching for month:', {
        startOfMonth: startOfMonth.toISOString(),
        endOfMonth: endOfMonth.toISOString(),
        profileId
      });

      // Fetch profile goals and events for the entire month
      const [profileResult, eventsResult] = await Promise.all([
        (supabase as any)
          .from('profiles')
          .select('daily_review_goal, daily_roleplay_goal, daily_journal_goal')
          .eq('id', profileId)
          .maybeSingle(),
        (supabase as any)
          .from('learning_events')
          .select('event_type, created_at')
          .eq('profile_id', profileId)
          .gte('created_at', startOfMonth.toISOString())
          .lte('created_at', endOfMonth.toISOString())
          .neq('event_type', 'session_active')
      ]);

      if (profileResult.error) throw profileResult.error;
      if (eventsResult.error) throw eventsResult.error;

      const profile = profileResult.data;
      const events = eventsResult.data || [];

      // Group events by date
      const eventsByDate = new Map<string, { [key: string]: number }>();
      
      events.forEach((event: any) => {
        const eventDate = new Date(event.created_at);
        const dateKey = `${eventDate.getUTCFullYear()}-${String(eventDate.getUTCMonth() + 1).padStart(2, '0')}-${String(eventDate.getUTCDate()).padStart(2, '0')}`;
        
        if (!eventsByDate.has(dateKey)) {
          eventsByDate.set(dateKey, {});
        }
        
        const dayCounts = eventsByDate.get(dateKey)!;
        dayCounts[event.event_type] = (dayCounts[event.event_type] || 0) + 1;
      });

      // Create goal statuses for each date
      const goalStatuses = new Map<string, DailyGoalStatus>();
      
      eventsByDate.forEach((counts, dateKey) => {
        goalStatuses.set(dateKey, {
          date: dateKey,
          vocab_created: {
            completed: counts['vocab_created'] || 0,
            target: profile?.daily_review_goal || 10,
          },
          journal_created: {
            completed: counts['journal_created'] || 0,
            target: profile?.daily_journal_goal || 1,
          },
          roleplay_completed: {
            completed: counts['roleplay_completed'] || 0,
            target: profile?.daily_roleplay_goal || 1,
          },
        });
      });

      console.log('[getMonthlyGoalStatuses] Generated statuses for', goalStatuses.size, 'days');

      return goalStatuses;
    } catch (error) {
      console.error('Error fetching monthly goal statuses:', error);
      return new Map();
    }
  }

  /**
   * Get comprehensive analytics summary
   */
  async getAnalyticsSummary(
    profileId: string,
    startDate: Date,
    endDate: Date
  ): Promise<AnalyticsSummary> {
    try {
      const [dailyGoal, weeklyActivity, grammarErrors, streak] = await Promise.all([
        this.getDailyGoalStatus(profileId),
        this.getWeeklyActivity(profileId, startDate, endDate),
        this.getGrammarErrorSummary(profileId, startDate, endDate),
        this.getStreak(profileId),
      ]);

      return {
        dailyGoal,
        weeklyActivity,
        grammarErrors,
        streak,
      };
    } catch (error) {
      console.error('Error fetching analytics summary:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();
