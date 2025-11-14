'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { RoleplayMessage, RoleplaySession, RoleplayScenario } from '@/types/roleplay';

export interface RoleplaySessionData {
  session_id: string;
  scenario_name: string;
  messages: RoleplayMessage[];
}

/**
 * Service for managing roleplay session storage in sessions table
 */
class RoleplaySessionService {
  /**
   * Save a completed roleplay session
   */
  async saveSession(
    userId: string,
    scenario: RoleplayScenario,
    messages: RoleplayMessage[]
  ): Promise<string> {
    try {
      const supabase = createClientComponentClient();
      
      // Transform messages to database format
      const dbMessages = messages.map(msg => ({
        text: msg.content,
        sender: msg.sender
      }));
      
      const { data, error } = await supabase
        .from('sessions')
        .insert({
          profile_id: userId,
          roleplay_id: scenario.id,
          conversation_json: { messages: dbMessages }
        })
        .select('session_id')
        .single();

      if (error) {
        console.error('Error saving roleplay session:', error);
        throw new Error('Failed to save session');
      }

      return data.session_id;
    } catch (error) {
      console.error('Error in saveSession:', error);
      throw error;
    }
  }

  /**
   * Get all roleplay sessions for a user
   */
  async getSessions(userId: string): Promise<RoleplaySessionData[]> {
    try {
      const supabase = createClientComponentClient();
      
      const { data, error } = await supabase
        .from('sessions')
        .select(`
          session_id,
          conversation_json,
          roleplays(
            name
          )
        `)
        .eq('profile_id', userId);

      if (error) {
        console.error('Error fetching roleplay sessions:', error);
        throw new Error('Failed to load sessions');
      }

      return data.map(session => {
        const rawMessages = session.conversation_json?.messages || [];
        const transformedMessages = rawMessages.map((msg: any, index: number) => ({
          id: `${session.session_id}-${index}`,
          content: msg.text || msg.content || '',
          sender: msg.sender === 'user' ? 'user' as const : 'bot' as const,
          timestamp: Date.now() - (rawMessages.length - index) * 1000
        }));

        return {
          session_id: session.session_id,
          scenario_name: (session.roleplays as any)?.name || 'Unknown Scenario',
          messages: transformedMessages
        };
      });
    } catch (error) {
      console.error('Error in getSessions:', error);
      throw error;
    }
  }

  /**
   * Get a specific session by ID
   */
  async getSessionById(sessionId: string): Promise<RoleplaySessionData | null> {
    try {
      const supabase = createClientComponentClient();
      
      const { data, error } = await supabase
        .from('sessions')
        .select(`
          session_id,
          conversation_json,
          roleplays(
            name
          )
        `)
        .eq('session_id', sessionId)
        .single();

      if (error) {
        console.error('Error fetching session:', error);
        return null;
      }

      const rawMessages = data.conversation_json?.messages || [];
      const transformedMessages = rawMessages.map((msg: any, index: number) => ({
        id: `${data.session_id}-${index}`,
        content: msg.text || msg.content || '',
        sender: msg.sender === 'user' ? 'user' as const : 'bot' as const,
        timestamp: Date.now() - (rawMessages.length - index) * 1000
      }));

      return {
        session_id: data.session_id,
        scenario_name: (data.roleplays as any)?.name || 'Unknown Scenario',
        messages: transformedMessages
      };
    } catch (error) {
      console.error('Error in getSessionById:', error);
      return null;
    }
  }

  /**
   * Save feedback assessment for a session
   */
  async saveFeedback(sessionId: string, feedback: string): Promise<void> {
    try {
      const supabase = createClientComponentClient();
      
      const { error } = await supabase
        .from('sessions')
        .update({ feedback })
        .eq('session_id', sessionId);

      if (error) {
        console.error('Error saving feedback:', error);
        throw new Error('Failed to save feedback to database');
      }
    } catch (error) {
      console.error('Error in saveFeedback:', error);
      throw error;
    }
  }
}

export const roleplaySessionService = new RoleplaySessionService();