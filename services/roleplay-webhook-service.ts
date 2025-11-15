import { RoleplayMessage, RoleplayScenario } from '@/types/roleplay';

class RoleplayWebhookService {
  async getBotResponse(scenario: RoleplayScenario, messages: RoleplayMessage[]): Promise<string> {
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

    const response = await fetch('/api/roleplay/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(`Bot response failed (${response.status}): ${errorData.error || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.message || data.output || 'No response received';
  }
}

export const roleplayWebhookService = new RoleplayWebhookService();