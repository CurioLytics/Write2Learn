import { supabase } from '@/services/supabase/client';

export interface FeedbackLogData {
  profile_id: string;
  type: 'grammar' | 'vocab';
  grammar_id?: string;
  vocab_id?: string;
  details: any;
}

export class FeedbackLogsService {
  async saveFeedbackLogs(userId: string, fbDetails: any[]): Promise<void> {
    if (!fbDetails || fbDetails.length === 0) return;

    const feedbackLogs: FeedbackLogData[] = fbDetails.map(detail => ({
      profile_id: userId,
      type: 'grammar',
      grammar_id: detail.type,
      details: detail.fix 
    }));

    const { error } = await supabase
      .from('feedback_logs')
      .insert(feedbackLogs as any);

    if (error) {
      console.error('Error saving feedback logs:', error);
      throw new Error(`Failed to save feedback logs: ${error.message}`);
    }
  }
}

export const feedbackLogsService = new FeedbackLogsService();