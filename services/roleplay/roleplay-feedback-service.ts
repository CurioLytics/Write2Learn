'use client';

import { RoleplayMessage, RoleplayScenario, RoleplayFeedback } from '@/types/roleplay';
import { handleServiceError, parseFeedbackResponse } from '@/utils/roleplay-utils';

/**
 * Service for generating AI feedback on roleplay conversations
 */
class RoleplayFeedbackService {
  /**
   * Generate feedback for a roleplay conversation
   * Calls external webhook to analyze conversation and return structured feedback
   */
  async generateFeedback(scenario: RoleplayScenario, messages: RoleplayMessage[]): Promise<RoleplayFeedback> {
    try {
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

      const response = await fetch('https://auto2.elyandas.com/webhook/roleplay-assesment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'No error details');
        throw new Error(`Webhook returned ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      return parseFeedbackResponse(data);
    } catch (error) {
      handleServiceError('generateFeedback', error, 'Failed to generate feedback');
    }
  }
}

export const roleplayFeedbackService = new RoleplayFeedbackService();
