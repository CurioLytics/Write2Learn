export type JournalTemplateCategory = 'Journaling' | 'Productivity' | 'Wellness' | 'Decision Making' | 'Problem Solving' | 'Business';

/**
 * Interface for the templates table
 * - profile_id: UUID of the user who owns the template (empty for default templates)
 * - name: Title or name of the journal template
 * - content: The actual prompt or body of the journal entry
 * - cover_image: URL or path to the template's cover image
 * - id: Unique identifier for the template
 * - category: Template category
 * - tag: Array of tags associated with the template
 * - other: Additional template metadata
 * - is_default: Whether this is a default template available to all users (for journal_template table)
 */
export interface JournalTemplate {
  id?: string;
  profile_id?: string;
  name: string;
  content: string;
  cover_image?: string | null;
  category?: string | null;
  tag?: string[] | null;
  other?: string | null;
  is_default?: boolean | null;
}

/**
 * Interface for the core feedback content returned by the feedback API
 */
export interface JournalFeedbackContent {
  title: string;
  summary: string;
  improvedVersion: string;
  originalVersion?: string; // Optional: Original journal content before improvement
  vocabSuggestions?: Array<{
    word: string;
    meaning?: string;
    example?: string;
  }>;
  highlights?: string[]; // Array of text highlights from journal content
}

/**
 * Interface for the raw webhook output structure
 * Based on the actual webhook response, these fields are required
 */
export interface WebhookOutput {
  title: string;
  summary: string;
  improvedVersion: string;
}

export interface WebhookResponseItem {
  output: WebhookOutput;
}

/**
 * Complete webhook response (array of items)
 */
export type WebhookResponse = WebhookResponseItem[];

/**
 * Interface for journal feedback used throughout the application
 * This maintains backward compatibility with existing code
 */
export interface JournalFeedback extends JournalFeedbackContent {
  // Extends the content structure to maintain backward compatibility
}

// Keep legacy interface for transition period
export interface LegacyJournalTemplate {
  id: string;
  name: string;
  description: string;
  category: JournalTemplateCategory;
  icon: string;
  templateType: 'daily_reflection' | 'prompt_based' | 'goal_oriented' | 'gratitude' | 'mindfulness' | 'habit_tracker' | 'pros_cons' | 'decision_journal' | 'problem_solving';
}

export const TEMPLATE_CATEGORIES: JournalTemplateCategory[] = [
  'Journaling',
  'Productivity',
  'Wellness',
  'Decision Making',
  'Problem Solving',
  'Business'
];

/**
 * Interface for a journal entry
 */
export interface Journal {
  id: string;
  title: string;
  content: string;
  journal_date: string; // ISO date string
  created_at?: string; // Timestamp for sorting
}

/**
 * Interface for journal statistics
 */
export interface JournalStats {
  total_journals: number;
  current_streak: number;
}