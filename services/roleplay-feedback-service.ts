import { RoleplayMessage, RoleplayScenario } from '@/types/roleplay';

const FEEDBACK_WEBHOOK_URL = 'https://automain.elyandas.com/webhook/roleplay-assesment';

interface FeedbackPayload {
  scenario_context: {
    title: string;
    context: string;
    difficulty: string;
    role1: string;
    guide: string;
  };
  messages: {
    role: string;
    content: string;
  }[];
}

interface FeedbackResponse {
  feedback?: string;
  assessment?: string;
  message?: string;
  text?: string;
}

class RoleplayFeedbackService {
  async generateFeedback(scenario: RoleplayScenario, messages: RoleplayMessage[]): Promise<string> {
    const payload: FeedbackPayload = {
      scenario_context: {
        title: scenario.name,
        context: scenario.context,
        difficulty: scenario.level,
        role1: scenario.role1,
        guide: scenario.guide
      },
      messages: messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : scenario.role1,
        content: msg.content
      }))
    };

    const response = await fetch(FEEDBACK_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Feedback service failed with status ${response.status}`);
    }

    const data = await response.json();
    
    // Handle array response format
    if (Array.isArray(data) && data.length > 0) {
      return data[0].text || data[0].feedback || data[0].assessment || data[0].message || 'Assessment completed successfully.';
    }
    
    // Handle object response format
    const responseData: FeedbackResponse = data;
    return responseData.feedback || responseData.assessment || responseData.message || responseData.text || 'Assessment completed successfully.';
  }
}

export const roleplayFeedbackService = new RoleplayFeedbackService();