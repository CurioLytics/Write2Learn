'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { RoleplayMessage, RoleplayScenario, RoleplayFeedback, RoleplaySessionData } from '@/types/roleplay';
import { errorLog } from '@/utils/roleplay-utils';
import { roleplayFeedbackService } from './roleplay-feedback-service';

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
      
      if (feedback && feedback.clarity) {
        await this.saveFeedback(sessionId, feedback);
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
    
    // Generate feedback
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
    if (feedback && feedback.clarity) {
      await this.saveFeedback(sessionId, feedback);
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
        parsedFeedback = { clarity: data.feedback, vocabulary: '', grammar: '', ideas: '', improved_version: [] };
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

    // Get user preferences with defaults
    const { data: profile } = await supabase
      .from('profiles')
      .select('name, english_level, style')
      .eq('id', userId)
      .single();

    // Generate vocabulary from highlights with consistent structure
    const payload = {
      user: {
        id: userId,
        name: profile?.name || 'User',
        english_level: profile?.english_level || 'intermediate',
        style: profile?.style || 'conversational',
      },
      title: `Roleplay: ${sessionData.scenario_name}`,
      context: sessionData.feedback,
      highlights,
    };

    const response = await fetch('https://auto2.elyandas.com/webhook/save-process-highlight-v1', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error(`Failed to generate vocabulary: ${response.status}`);
    return response.json();
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
}

export const roleplaySessionService = new RoleplaySessionService();