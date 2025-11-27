/**
 * Webhook utility functions with timeout, retry, and error handling
 */

interface WebhookOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PUT';
  body?: any;
  timeout?: number; // milliseconds
  retries?: number;
  headers?: Record<string, string>;
}

interface WebhookResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  latency?: number;
}

/**
 * Call webhook with timeout and retry logic
 */
export async function callWebhookWithRetry<T = any>(
  options: WebhookOptions
): Promise<WebhookResponse<T>> {
  const {
    url,
    method = 'POST',
    body,
    timeout = 30000, // 30 second default
    retries = 2,
    headers = {}
  } = options;

  const startTime = Date.now();
  let lastError: any;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const latency = Date.now() - startTime;

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`Webhook failed: ${response.status} - ${errorText}`);
      }

      const text = await response.text();
      let data: T;

      try {
        data = JSON.parse(text) as T;
      } catch {
        // If response is not JSON, return as is
        data = text as any;
      }

      return {
        success: true,
        data,
        latency
      };

    } catch (error: any) {
      lastError = error;
      
      // Don't retry on abort (timeout)
      if (error.name === 'AbortError') {
        console.error(`Webhook timeout after ${timeout}ms:`, url);
        break;
      }

      // Wait before retry (exponential backoff)
      if (attempt < retries) {
        const waitTime = Math.min(1000 * Math.pow(2, attempt), 5000);
        console.log(`Webhook attempt ${attempt + 1} failed, retrying in ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  const latency = Date.now() - startTime;
  return {
    success: false,
    error: lastError?.message || 'Webhook failed after retries',
    latency
  };
}

/**
 * Wrapper for journal feedback webhook
 */
export async function callJournalFeedbackWebhook(journalContent: string, userId: string) {
  const webhookUrl = process.env.NEXT_PUBLIC_GET_FEEDBACK_WEBHOOK_URL;
  
  if (!webhookUrl) {
    return {
      success: false,
      error: 'Webhook URL not configured'
    };
  }

  return callWebhookWithRetry({
    url: webhookUrl,
    body: { content: journalContent, user_id: userId },
    timeout: 60000 // 1 minute for AI processing
  });
}

/**
 * Wrapper for roleplay webhook
 */
export async function callRoleplayWebhook(data: any) {
  const webhookUrl = process.env.GET_ROLEPLAY_WEBHOOK_URL || 
                     'https://auto2.elyandas.com/webhook/roleplay';
  
  return callWebhookWithRetry({
    url: webhookUrl,
    body: data,
    timeout: 45000, // 45 seconds
    retries: 1 // Roleplay is time-sensitive, only retry once
  });
}

/**
 * Wrapper for flashcard generation webhook
 */
export async function callFlashcardWebhook(highlights: string[], userId: string) {
  const webhookUrl = process.env.NEXT_PUBLIC_SAVE_HIGHLIGHTS_WEBHOOK_URL;
  
  if (!webhookUrl) {
    return {
      success: false,
      error: 'Webhook URL not configured'
    };
  }

  return callWebhookWithRetry({
    url: webhookUrl,
    body: { highlights, user_id: userId },
    timeout: 40000 // 40 seconds
  });
}

/**
 * Health check for webhook service
 */
export async function checkWebhookHealth(url: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
}
