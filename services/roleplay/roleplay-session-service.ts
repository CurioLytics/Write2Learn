import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { RoleplayMessage, RoleplayScenario, RoleplayFeedback, RoleplaySessionData } from '@/types/roleplay';
import { errorLog } from '@/utils/roleplay-utils';
import { roleplayFeedbackService } from './roleplay-feedback-service';
import { feedbackLogsService } from '@/services/supabase/feedback-logs-service';
import { flashcardGenerationService } from '@/services/flashcard-generation-service';

class RoleplaySessionService {
  /**
   * Complete session workflow: Save + Generate feedback
   */
  async completeSession(
    userId: string, 
    scenario: RoleplayScenario, 
    messages: RoleplayMessage[],
    userPreferences?: { name?: string; english_level?: string; style?: string } | null
  ): Promise<string> {
    const supabase = createClientComponentClient();
    
    // Save session
    const { data, error } = await supabase
      .from('sessions')
      .insert({
        profile_id: userId,
        roleplay_id: scenario.id,
        conversation_json: { messages }
      })
      .select('session_id')
      .single();

    if (error) throw new Error(`Failed to save session: ${error.message}`);
    
    const sessionId = data.session_id;
    
    // Generate feedback
    try {
      const feedback = await roleplayFeedbackService.generateFeedback(scenario, messages, userPreferences);
      
      if (feedback && feedback.output?.clarity) {
        // Save to sessions table (legacy format)
        await this.saveFeedback(sessionId, feedback);
        
        // Save to feedbacks and feedback_grammar_items tables
        await this.saveFeedbackToTables(userId, sessionId, feedback);
      }
    } catch (feedbackError) {
      errorLog('completeSession', feedbackError);
    }
    
    return sessionId;
  }

  /**
   * Retry feedback generation for a session
   */
  async retryFeedback(
    sessionId: string, 
    userPreferences?: { name?: string; english_level?: string; style?: string } | null
  ): Promise<RoleplayFeedback> {
    const supabase = createClientComponentClient();
    
    // Get session data
    const { data: session, error } = await supabase
      .from('sessions')
      .select(`
        profile_id,
        conversation_json,
        roleplays(id, name, level, ai_role, partner_prompt)
      `)
      .eq('session_id', sessionId)
      .single();
    
    if (error || !session) {
      throw new Error('Session not found');
    }
    
    const scenario = session.roleplays as any;
    const messages = session.conversation_json?.messages || [];
    
    // Generate feedback with user preferences
    const feedback = await roleplayFeedbackService.generateFeedback(
      {
        id: scenario.id,
        name: scenario.name,
        level: scenario.level,
        ai_role: scenario.ai_role,
        partner_prompt: scenario.partner_prompt,
        context: '',
        starter_message: '',
        task: '',
        topic: '',
        image: null
      },
      messages,
      userPreferences
    );
    
    // Save feedback
    if (feedback && feedback.output?.clarity) {
      // Save to sessions table (legacy format)
      await this.saveFeedback(sessionId, feedback);
      
      // Get userId from session
      const userId = session.profile_id || (await supabase.auth.getUser()).data.user?.id;
      if (userId) {
        await this.saveFeedbackToTables(userId, sessionId, feedback);
      }
    }
    
    return feedback;
  }

  async getSessionWithFeedback(sessionId: string) {
    const supabase = createClientComponentClient();
    
    const { data, error } = await supabase
      .from('sessions')
      .select(`
        session_id,
        conversation_json,
        feedback,
        highlights,
        created_at,
        roleplays(name, context, ai_role)
      `)
      .eq('session_id', sessionId)
      .single();

    if (error || !data) throw new Error(`Session not found: ${error?.message}`);
    
    // Parse feedback if it's a JSON string
    let parsedFeedback = null;
    if (data.feedback) {
      try {
        parsedFeedback = typeof data.feedback === 'string' ? JSON.parse(data.feedback) : data.feedback;
      } catch {
        // Fallback for old format - convert to new structure
        parsedFeedback = { 
          enhanced_version: '',
          grammar_details: [],
          output: {
            clarity: typeof data.feedback === 'string' ? data.feedback : '', 
            vocabulary: '', 
            ideas: ''
          }
        };
      }
    }

    return {
      session_id: data.session_id,
      scenario_name: (data.roleplays as any)?.name || 'Unknown Scenario',
      scenario: (data.roleplays as any) || { name: '', context: '', ai_role: '' },
      feedback: parsedFeedback,
      messages: data.conversation_json?.messages || [],
      highlights: data.highlights || [],
      created_at: data.created_at || new Date().toISOString()
    };
  }

  /**
   * Get user's roleplay session history
   */
  async getSessions(userId: string): Promise<RoleplaySessionData[]> {
    const supabase = createClientComponentClient();
    
    const { data, error } = await supabase
      .from('sessions')
      .select(`
        session_id,
        conversation_json,
        feedback,
        highlights,
        created_at,
        roleplays(name, context, ai_role)
      `)
      .eq('profile_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      errorLog('getSessions', error);
      throw new Error(`Failed to load sessions: ${error.message}`);
    }

    if (!data) return [];

    return data.map(session => ({
      session_id: session.session_id,
      scenario_name: (session.roleplays as any)?.name || 'Unknown Scenario',
      scenario: session.roleplays as any,
      feedback: session.feedback,
      messages: session.conversation_json?.messages || [],
      highlights: session.highlights || [],
      created_at: session.created_at
    }));
  }

  /**
   * Save highlights and generate vocabulary
   */
  async saveHighlightsAndGenerateFlashcards(sessionId: string, highlights: string[], sessionData: any, userId: string) {
    const supabase = createClientComponentClient();
    
    // Save highlights
    const { error } = await supabase
      .from('sessions')
      .update({ highlights })
      .eq('session_id', sessionId);

    if (error) throw new Error(`Failed to save highlights: ${error.message}`);

    // Generate flashcards using shared service
    const result = await flashcardGenerationService.generateFromRoleplay(
      userId,
      sessionData.scenario_name,
      sessionData.feedback,
      highlights
    );

    return { flashcards: result.flashcards };
  }

  private async saveFeedback(sessionId: string, feedback: RoleplayFeedback): Promise<void> {
    const supabase = createClientComponentClient();
    
    const { error } = await supabase
      .from('sessions')
      .update({ feedback: JSON.stringify(feedback) })
      .eq('session_id', sessionId);

    if (error) {
      throw new Error(`Failed to save feedback: ${error.message}`);
    }
  }

  /**
   * Save feedback to feedbacks and feedback_grammar_items tables
   */
  private async saveFeedbackToTables(userId: string, sessionId: string, feedback: RoleplayFeedback): Promise<void> {
    try {
      await feedbackLogsService.saveFeedback({
        userId,
        sourceId: sessionId,
        sourceType: 'roleplay',
        feedbackData: {
          clarity: feedback.output?.clarity,
          vocabulary: feedback.output?.vocabulary,
          ideas: feedback.output?.ideas,
          enhanced_version: feedback.enhanced_version,
        },
        grammarDetails: feedback.grammar_details || [],
      });
    } catch (error) {
      console.error('Failed to save feedback to tables:', error);
      // Don't throw - feedback is already saved to sessions table
    }
  }
}

export const roleplaySessionService = new RoleplaySessionService();