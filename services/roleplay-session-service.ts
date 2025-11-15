'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { RoleplayMessage, RoleplayScenario } from '@/types/roleplay';
import { rootTaskDispose } from 'next/dist/build/swc/generated-native';

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
      const feedback = await this.generateFeedback(scenario, messages);
      await this.saveFeedback(sessionId, feedback);
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
    return Array.isArray(data) ? data[0]?.text : data.feedback;
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
   * Save highlights and generate flashcards
   */
  async saveHighlightsAndGenerateFlashcards(sessionId: string, highlights: string[], sessionData: any, userId: string) {
    const supabase = createClientComponentClient();
    
    // Save highlights
    const { error } = await supabase
      .from('sessions')
      .update({ highlights })
      .eq('session_id', sessionId);

    if (error) throw new Error(`Failed to save highlights: ${error.message}`);

    // Generate flashcards
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

    if (!response.ok) throw new Error(`Failed to generate flashcards: ${response.status}`);
    return response.json();
  }

  private async saveFeedback(sessionId: string, feedback: string): Promise<void> {
    const supabase = createClientComponentClient();
    
    const { error } = await supabase
      .from('sessions')
      .update({ feedback })
      .eq('session_id', sessionId);

    if (error) throw new Error(`Failed to save feedback: ${error.message}`);
  }
}

export const roleplaySessionService = new RoleplaySessionService();