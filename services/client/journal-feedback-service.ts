import { JournalFeedback } from '@/types/journal';

class JournalFeedbackService {
  async getFeedback(content: string, title?: string): Promise<JournalFeedback> {
    if (!content.trim()) throw new Error('Journal content cannot be empty');

    const response = await fetch('/api/journal-feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, title: title || '' }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Request failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('Raw feedback response:', JSON.stringify(data, null, 2));


    // Handle array-based webhook response
    const feedback = Array.isArray(data) && data[0]?.output ? data[0].output : data;

    return {
      title: feedback.title || title || 'Journal Entry',
      summary: feedback.summary || 'No summary available',
      improvedVersion: feedback.improvedVersion || content,
      originalVersion: feedback.originalVersion || content,
      vocabSuggestions: Array.isArray(feedback.vocabSuggestions)
        ? feedback.vocabSuggestions.map((item: any) => ({
            word: item?.word || item?.term || 'Unknown word',
            meaning: item?.meaning || item?.definition || 'No meaning provided',
            example: item?.example || '',
          }))
        : [],
    };
  }
}

export const journalFeedbackService = new JournalFeedbackService();
