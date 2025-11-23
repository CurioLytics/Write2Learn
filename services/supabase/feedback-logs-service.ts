import { supabase } from '@/services/supabase/client';
import { GrammarDetail } from '@/types/journal-feedback';

export class FeedbackLogsService {
  /**
   * Save feedback to feedbacks table and grammar details to feedback_grammar_items table
   * @param userId - User ID
   * @param sourceId - Journal ID or Session ID
   * @param sourceType - 'journal' or 'roleplay'
   * @param feedbackData - Feedback content (clarity, vocabulary, ideas, enhanced_version)
   * @param grammarDetails - Array of grammar corrections
   */
  async saveFeedback({
    userId,
    sourceId,
    sourceType,
    feedbackData,
    grammarDetails
  }: {
    userId: string;
    sourceId: string;
    sourceType: 'journal' | 'roleplay';
    feedbackData: {
      clarity?: string;
      vocabulary?: string;
      ideas?: string;
      enhanced_version?: string;
    };
    grammarDetails?: GrammarDetail[];
  }): Promise<string> {
    // Step 1: Insert into feedbacks table
    const { data: feedbackRecord, error: feedbackError } = await supabase
      .from('feedbacks')
      .insert({
        profile_id: userId,
        source_id: sourceId,
        source_type: sourceType,
        clarity_feedback: feedbackData.clarity || null,
        vocabulary_feedback: feedbackData.vocabulary || null,
        ideas_feedback: feedbackData.ideas || null,
        enhanced_version: feedbackData.enhanced_version || null,
      })
      .select('id')
      .single();

    if (feedbackError) {
      console.error('Error saving feedback:', feedbackError);
      throw new Error(`Failed to save feedback: ${feedbackError.message}`);
    }

    const feedbackId = feedbackRecord.id;

    // Step 2: Insert grammar details into feedback_grammar_items table
    if (grammarDetails && grammarDetails.length > 0) {
      // Validate grammar_topic_ids exist in grammar_topics table
      const topicIds = grammarDetails
        .map(d => d.grammar_topic_id)
        .filter(id => id != null);

      let validTopicIds = new Set<string>();
      
      if (topicIds.length > 0) {
        const { data: existingTopics } = await supabase
          .from('grammar_topics')
          .select('topic_id')
          .in('topic_id', topicIds);
        
        validTopicIds = new Set(existingTopics?.map(t => t.topic_id) || []);
      }

      // Insert only items with valid topic IDs or null
      const grammarItems = grammarDetails.map(detail => ({
        feedback_id: feedbackId,
        grammar_topic_id: validTopicIds.has(detail.grammar_topic_id) ? detail.grammar_topic_id : null,
        description: detail.description,
        tags: detail.tags || [],
      }));

      const { error: grammarError } = await supabase
        .from('feedback_grammar_items')
        .insert(grammarItems);

      if (grammarError) {
        console.error('Error saving grammar items:', grammarError);
        // Don't throw - feedback is already saved
      }
    }

    return feedbackId;
  }

  /**
   * Legacy method - kept for backward compatibility
   * @deprecated Use saveFeedback instead
   */
  async saveFeedbackLogs(userId: string, grammarDetails: GrammarDetail[]): Promise<void> {
    if (!grammarDetails || grammarDetails.length === 0) return;

    const feedbackItems = grammarDetails.map(detail => ({
      profile_id: userId,
      grammar_id: detail.grammar_topic_id,
      details: detail.description,
      type: 'grammar',
    }));

    const { error } = await supabase
      .from('feedback_logs')
      .insert(feedbackItems as any);

    if (error) {
      console.error('Error saving feedback logs:', error);
      throw new Error(`Failed to save feedback logs: ${error.message}`);
    }
  }
}

export const feedbackLogsService = new FeedbackLogsService();