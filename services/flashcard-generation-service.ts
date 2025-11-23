/**
 * Flashcard Generation Service
 * 
 * Centralized service for generating flashcards from highlights via webhook.
 * Used by both journal and roleplay features to avoid duplication.
 */

interface FlashcardGenerationPayload {
  user: {
    id: string;
    name: string;
    english_level: string;
    style: string;
  };
  title: string;
  context: string;
  highlights: string[];
}

interface GeneratedFlashcard {
  word: string;
  back: string; // Plain string containing definition/meaning
}

interface FlashcardGenerationResult {
  flashcards: GeneratedFlashcard[];
  totalGenerated: number;
}

class FlashcardGenerationService {
  private readonly webhookUrl = 'https://auto2.elyandas.com/webhook/save-process-highlight-v1';
  private readonly timeout = 60000; // 60 seconds

  /**
   * Generate flashcards from highlights using external AI webhook
   * 
   * @param payload - The generation payload containing highlights and context
   * @returns Promise with generated flashcards
   */
  async generateFlashcards(payload: FlashcardGenerationPayload): Promise<FlashcardGenerationResult> {
    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(this.timeout),
      });

      if (!response.ok) {
        console.error('Webhook error:', {
          status: response.status,
          statusText: response.statusText
        });
        throw new Error(`Failed to generate flashcards: ${response.status} ${response.statusText}`);
      }

      const responseData = await response.json();

      // Parse webhook response structure: can be either:
      // { output: [{ word, back }] } OR [{ output: [{ word, back }] }]
      let flashcards: GeneratedFlashcard[] = [];
      
      if (responseData?.output && Array.isArray(responseData.output)) {
        // Direct object with output property
        flashcards = responseData.output;
      } else if (Array.isArray(responseData) && responseData.length > 0 && responseData[0]?.output) {
        // Array containing object with output property
        flashcards = responseData[0].output;
      } else {
        console.error('Unexpected webhook response structure:', responseData);
        throw new Error('Invalid flashcard response structure from webhook');
      }

      // Validate flashcard format where back is a string
      const validFlashcards = flashcards.filter((card: any) => 
        card && 
        typeof card.word === 'string' && 
        typeof card.back === 'string'
      ).map((card: any) => ({
        word: card.word,
        back: card.back
      }));

      console.log(`Generated ${validFlashcards.length} flashcards from ${payload.highlights.length} highlights`);

      return {
        flashcards: validFlashcards,
        totalGenerated: validFlashcards.length
      };
    } catch (error) {
      console.error('Flashcard generation error:', error);
      throw error;
    }
  }

  /**
   * Generate flashcards for journal content
   * 
   * @param user - User object with id, name, english_level, style
   * @param title - Journal title
   * @param content - Journal content (improved/enhanced version)
   * @param highlights - Selected highlights
   * @returns Promise with generated flashcards
   */
  async generateFromJournal(
    user: { id: string; name: string; english_level: string; style: string },
    title: string,
    content: string,
    highlights: string[]
  ): Promise<FlashcardGenerationResult> {
    return this.generateFlashcards({
      user,
      title,
      context: content,
      highlights
    });
  }

  /**
   * Generate flashcards for roleplay feedback
   * 
   * @param user - User object with id, name, english_level, style
   * @param scenarioName - Roleplay scenario name
   * @param feedback - Roleplay feedback object
   * @param highlights - Selected highlights
   * @returns Promise with generated flashcards
   */
  async generateFromRoleplay(
    user: { id: string; name: string; english_level: string; style: string },
    scenarioName: string,
    feedback: any,
    highlights: string[]
  ): Promise<FlashcardGenerationResult> {
    // Build context from all feedback sections
    const feedbackContext = [
      feedback?.clarity ? `Clarity: ${feedback.clarity}` : '',
      feedback?.vocabulary ? `Vocabulary: ${feedback.vocabulary}` : '',
      feedback?.grammar ? `Grammar: ${feedback.grammar}` : '',
      feedback?.ideas ? `Ideas: ${feedback.ideas}` : '',
      feedback?.improved_version?.length ? `Improved Version:\n${feedback.improved_version.join('\n')}` : ''
    ].filter(Boolean).join('\n\n');

    return this.generateFlashcards({
      user,
      title: `Roleplay: ${scenarioName}`,
      context: feedbackContext,
      highlights
    });
  }
}

export const flashcardGenerationService = new FlashcardGenerationService();
