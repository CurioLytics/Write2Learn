import { supabase } from '@/services/supabase/client';
import { Tables } from '@/types/database.types';
import type { DashboardStats, ErrorAnalysis, UserProfile, ErrorAnalysisFilters } from '@/types/dashboard';

/**
 * Service để lấy thông tin tổng quan cho dashboard
 */
export class DashboardService {
  /**
   * Lấy thống kê tổng quan từ bảng learning_progress theo spec
   */
  static async getDashboardStats(profileId: string): Promise<DashboardStats> {
    try {
      // Query từ bảng learning_progress như đã định nghĩa trong spec
      const { data: learningProgress, error: progressError } = await supabase
        .from('learning_progress')
        .select('total_words_learned, total_journals_completed, streak_days')
        .eq('profile_id', profileId)
        .single();

      if (progressError) {
        throw new Error(`Lỗi khi truy vấn learning_progress: ${progressError.message}`);
      }

      return {
        totalWordsLearned: (learningProgress as any)?.total_words_learned || 0,
        totalJournalsCompleted: (learningProgress as any)?.total_journals_completed || 0,
        streakDays: (learningProgress as any)?.streak_days || 0
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error; // Re-throw để component hiển thị lỗi thực tế
    }
  }

  /**
   * Lấy thông tin người dùng
   */
  static async getUserProfile(profileId: string): Promise<UserProfile> {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .single();

      if (error) {
        throw new Error(`Lỗi khi truy vấn profiles: ${error.message}`);
      }

      // Type assertion for the profile data
      const profileData = profile as any;

      return {
        id: profileData.id,
        email: '', // Email comes from auth.users, not profiles
        fullName: profileData.name || '',
        level: profileData.english_level || 'Beginner',
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error; // Re-throw để component hiển thị lỗi thực tế
    }
  }

  /**
   * Lấy phân tích lỗi từ feedback_logs với date filtering
   * Filtered by detected_at column based on provided date range
   */
  static async getErrorAnalysis(profileId: string, filters?: ErrorAnalysisFilters): Promise<ErrorAnalysis[]> {
    try {
      let query = supabase
        .from('feedback_logs')
        .select(`
          id,
          type,
          details,
          detected_at,
          grammar_id,
          vocab_id,
          grammar_topics:grammar_id(
            id,
            topic_name
          ),
          vocab_topics:vocab_id(
            id,
            topic_name
          )
        `)
        .eq('profile_id', profileId);

      // Apply date filter if provided
      if (filters?.dateRange) {
        query = query
          .gte('detected_at', filters.dateRange.from)
          .lte('detected_at', filters.dateRange.to);
      }

      const { data: feedbackLogs, error: feedbackError } = await query.order('detected_at', { ascending: false });

      if (feedbackError) {
        throw new Error(`Lỗi khi truy vấn feedback_logs: ${feedbackError.message}`);
      }

      // Transform to ErrorAnalysis[] format
      const errorAnalysis: ErrorAnalysis[] = [];
      
      (feedbackLogs as any[])?.forEach((log) => {
        const topicName = log.grammar_topics?.topic_name || log.vocab_topics?.topic_name || 'Unknown Topic';
        const category = log.type || 'unknown';
        
        errorAnalysis.push({
          id: log.id,
          category: category,
          description: typeof log.details === 'string' ? log.details : JSON.stringify(log.details || 'No details available'),
          frequency: 1, // Each log represents one occurrence
          detectedAt: log.detected_at,
          topicName: topicName,
        });
      });

      return errorAnalysis;

    } catch (error) {
      console.error('Error fetching error analysis:', error);
      throw error; // Re-throw để component có thể hiển thị lỗi thật
    }
  }
}