'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { RoleplayMessage, RoleplayScenario } from '@/types/roleplay';
import { rootTaskDispose } from 'next/dist/build/swc/generated-native';

export interface RoleplaySessionData {
  session_id: string;
  scenario_name: string;
  scenario: {
    name: string;
    context: string;
    ai_role: string;
  };
  feedback: string | null;
  messages: RoleplayMessage[];
  highlights: string[];
  created_at: string;
}

class RoleplaySessionService {
  /**
   * Complete session workflow: Save + Generate feedback
   */
  async completeSession(userId: string, scenario: RoleplayScenario, messages: RoleplayMessage[]): Promise<string> {
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
      console.log('Starting feedback generation for session:', sessionId);
      const feedback = await this.generateFeedback(scenario, messages);
      console.log('Generated feedback:', feedback);
      console.log('Feedback type:', typeof feedback);
      console.log('Feedback length:', feedback?.length);
      
      if (feedback && feedback !== 'Feedback processing error') {
        await this.saveFeedback(sessionId, feedback);
        console.log('Feedback saved successfully to database');
      } else {
        console.warn('Invalid feedback received, skipping save');
      }
    } catch (feedbackError) {
      // Continue even if feedback fails - user can still access summary
      console.error('Feedback generation failed:', feedbackError);
    }
    
    return sessionId;
  }

  private async generateFeedback(scenario: RoleplayScenario, messages: RoleplayMessage[]): Promise<string> {
    // Debug: Log scenario data before creating payload
    console.log('Session service - received scenario for feedback:', {
      id: scenario.id,
      name: scenario.name,
      partner_prompt: scenario.partner_prompt,
      partner_prompt_type: typeof scenario.partner_prompt
    });
    
    const payload = {
      body: {
        query: {
          title: scenario.name,
          level: scenario.level,
          ai_role: scenario.ai_role,
          partner_prompt: scenario.partner_prompt
        }
      },
      messages: messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : scenario.ai_role,
        content: msg.content
      }))
    };
    
    // Debug: Log the complete payload for feedback
    console.log('Session service - sending payload for feedback:', JSON.stringify(payload, null, 2));

    const response = await fetch('https://automain.elyandas.com/webhook/roleplay-assesment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Feedback service failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('Raw feedback response:', data);
    console.log('Response is array:', Array.isArray(data));
    
    let processedFeedback;
    if (Array.isArray(data) && data.length > 0 && data[0]?.text) {
      processedFeedback = data[0].text;
    } else if (data?.feedback) {
      processedFeedback = data.feedback;
    } else if (data?.text) {
      processedFeedback = data.text;
    } else if (typeof data === 'string') {
      processedFeedback = data;
    } else {
      console.error('Unexpected feedback format:', data);
      processedFeedback = 'Feedback processing error';
    }
    
    console.log('Processed feedback:', processedFeedback);
    
    return processedFeedback;
  }

  /**
   * Get session with feedback for summary page
   */
  async getSessionWithFeedback(sessionId: string) {
    const supabase = createClientComponentClient();
    
    const { data, error } = await supabase
      .from('sessions')
      .select(`
        session_id,
        conversation_json,
        feedback,
        highlights,
        roleplays(name, context, ai_role)
      `)
      .eq('session_id', sessionId)
      .single();

    if (error || !data) throw new Error(`Session not found: ${error?.message}`);
    
    console.log('Retrieved session data:', {
      session_id: data.session_id,
      has_feedback: !!data.feedback,
      feedback_length: data.feedback?.length,
      feedback_preview: data.feedback?.substring(0, 100)
    });

    return {
      session_id: data.session_id,
      scenario_name: (data.roleplays as any)?.name || 'Unknown Scenario',
      scenario: data.roleplays,
      feedback: data.feedback,
      messages: data.conversation_json?.messages || [],
      highlights: data.highlights || []
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
      console.error('Error fetching sessions:', error);
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

    // Generate vocabulary from highlights
    const payload = {
      userId,
      title: `Roleplay: ${sessionData.scenario_name}`,
      content: sessionData.feedback,
      journalDate: new Date().toISOString().split('T')[0],
      highlights,
    };

    const response = await fetch('https://automain.elyandas.com/webhook/save-process-highlight-v1', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error(`Failed to generate vocabulary: ${response.status}`);
    return response.json();
  }

  private async saveFeedback(sessionId: string, feedback: string): Promise<void> {
    console.log('Saving feedback to database:', {
      sessionId,
      feedback: feedback?.substring(0, 100) + '...', // Show first 100 chars
      feedbackLength: feedback?.length
    });
    
    const supabase = createClientComponentClient();
    
    const { error } = await supabase
      .from('sessions')
      .update({ feedback })
      .eq('session_id', sessionId);

    if (error) {
      console.error('Database error saving feedback:', error);
      throw new Error(`Failed to save feedback: ${error.message}`);
    }
    
    console.log('Feedback successfully saved to database');
  }
}

export const roleplaySessionService = new RoleplaySessionService();