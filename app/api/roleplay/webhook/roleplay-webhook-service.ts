'use client';

import { RoleplayMessage, RoleplayScenario } from '@/types/roleplay';

const ROLEPLAY_WEBHOOK_PROXY = "/api/roleplay/webhook";

interface WebhookRequestPayload {
  context: string;
  level: string;
  topic: string;
  ai_role: string;
  messages: RoleplayMessage[];
}

interface WebhookResponse {
  message?: string;
  output?: string;
}

class RoleplayWebhookService {
  async getBotResponse(scenario: RoleplayScenario, messages: RoleplayMessage[]): Promise<string> {
    const payload: WebhookRequestPayload = {
      context: scenario.context,
      level: scenario.level || 'Beginner',
      topic: scenario.topic || 'General',
      ai_role: scenario.role1 || 'Assistant',
      messages: messages
    };

    const response = await fetch(ROLEPLAY_WEBHOOK_PROXY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Webhook request failed with status ${response.status}`);
    }

    const responseData: WebhookResponse = await response.json();
    
    return responseData.message || responseData.output || "I'm here to help with your conversation practice.";
  }
}

export const roleplayWebhookService = new RoleplayWebhookService();
