import { RoleplayMessage, RoleplayScenario } from '@/types/roleplay';

class RoleplayWebhookService {
  async getBotResponse(scenario: RoleplayScenario, messages: RoleplayMessage[]): Promise<string> {
    // Debug: Log scenario data before creating payload
    console.log('Webhook service - received scenario:', {
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
    
    // Debug: Log the complete payload
    console.log('Webhook service - sending payload:', JSON.stringify(payload, null, 2));

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