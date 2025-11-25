import { createSupabaseClient } from '@/services/supabase/auth-helpers';
import { Journal, JournalStats } from '@/types/journal';

/**
 * Service for fetching and managing journal entries
 * 
 * NOTE: There is an inconsistency in the Supabase function parameter naming:
 * - get_journals expects a parameter named "_user_id"
 * - get_journal_stats expects a parameter named "user_uuid"
 * This is handled in each method accordingly.
 */
class JournalService {
  /**
   * Get all available journal tags
   * 
   * @returns Promise with array of tag names
   */
  async getJournalTags(): Promise<string[]> {
    try {
      console.log('getJournalTags - Fetching all journal tags');
      
      const supabase = createSupabaseClient();
      
      const { data, error } = await supabase
        .from('journal_tags')
        .select('name')
        .order('name');
      
      console.log('getJournalTags - Response from Supabase:', { data, error });
      
      if (error) {
        console.error('Error fetching journal tags:', error);
        throw error;
      }
      
      if (!data || !Array.isArray(data)) {
        console.warn('Invalid data structure returned from journal_tags:', data);
        return [];
      }
      
      return data.map((tag: any) => tag.name);
    } catch (error) {
      console.error('Error in getJournalTags:', error);
      throw error;
    }
  }

  /**
   * Get a single journal entry by ID
   * 
   * @param journalId The ID of the journal entry to fetch
   * @returns Promise with the journal entry
   */
  async getJournalById(journalId: string): Promise<Journal> {
    try {
      console.log('getJournalById - Fetching journal:', journalId);
      
      const supabase = createSupabaseClient();
      
      const { data, error } = await supabase
        .from('journals')
        .select('id, title, content, journal_date')
        .eq('id', journalId)
        .single();
      
      console.log('getJournalById - Response from Supabase:', { data, error });
      
      if (error) {
        console.error('Error fetching journal by ID:', error);
        throw error;
      }
      
      if (!data) {
        throw new Error('Journal not found');
      }
      
      return {
        id: String(data.id),
        title: data.title,
        content: data.content,
        journal_date: data.journal_date ?? new Date().toISOString()
      };
    } catch (error) {
      console.error('Error in getJournalById:', error);
      throw error;
    }
  }
  /**
   * Get journals filtered by tag from journal_tag table
   * 
   * @param userId The user ID to fetch journals for
   * @param tagName The tag name to filter by
   * @returns Promise with array of journal entries that have the specified tag
   */
  async getJournalsByTag(userId: string, tagName: string): Promise<Journal[]> {
    try {
      console.log('getJournalsByTag - Fetching journals for user:', userId, 'with tag:', tagName);
      
      const supabase = createSupabaseClient();
      
      const { data, error } = await supabase
        .from('journals')
        .select(`
          id,
          title,
          content,
          journal_date,
          journal_tag!inner(tag_id)
        `)
        .eq('user_id', userId)
        .eq('journal_tag.tag_id', tagName)
        .order('journal_date', { ascending: false });
      
      console.log('getJournalsByTag - Response from Supabase:', { data, error });
      
      if (error) {
        console.error('Error fetching journals by tag:', error);
        throw error;
      }
      
      if (!data || !Array.isArray(data)) {
        console.warn('Invalid data structure returned from journals:', data);
        return [];
      }
      
      return data.map((journal: any) => ({
        id: String(journal.id),
        title: journal.title,
        content: journal.content,
        journal_date: journal.journal_date ?? new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error in getJournalsByTag:', error);
      throw error;
    }
  }

  /**
   * Get all journal entries for a user
   * 
   * @param userId The user ID to fetch journals for
   * @returns Promise with array of journal entries
   */
  async getJournals(userId: string): Promise<Journal[]> {
    try {
      console.log('getJournals - userId being passed:', userId);
      
      const supabase = createSupabaseClient();
      
      // Call the get_journals Supabase function
      // Correct parameter name is _user_id
      const { data, error } = await supabase
        .rpc("get_journals", { _user_id: userId });
      
      console.log('getJournals - Response from Supabase:', { data, error });
      
      if (error) {
        console.error('Error fetching journals:', error);
        throw error;
      }
      
      if (!data || !Array.isArray(data)) {
        console.warn('Invalid data structure returned from get_journals:', data);
        return [];
      }
      
      console.log('getJournals - Processed data to return:', data?.length, 'entries');
      
      return data.map((journal: any) => ({
        id: String(journal.id),
        title: journal.title,
        content: journal.content,
        journal_date: journal.journal_date ?? journal.created_at ?? new Date().toISOString(),
        created_at: journal.created_at
      }));
    } catch (error) {
      console.error('Error in getJournals:', error);
      throw error;
    }
  }

  /**
   * Get journal statistics for a user
   * 
   * @param userId The user ID to fetch journal stats for
   * @returns Promise with journal statistics
   */
  async getJournalStats(userId: string): Promise<JournalStats> {
    try {
      console.log('getJournalStats - userId being passed:', userId);
      
      const supabase = createSupabaseClient();
      
      // Call the get_journal_stats Supabase function
      const { data, error } = await supabase
        .rpc('get_journal_stats', { user_uuid: userId });
      
      console.log('getJournalStats - Response from Supabase:', { data, error });
      
      if (error) {
        console.error('Error fetching journal stats:', error);
        throw error;
      }
      
      if (!data) {
        console.warn('Invalid data structure returned from get_journal_stats:', data);
        return {
          total_journals: 0,
          current_streak: 0
        };
      }
      
      // Handle the response as an array with one object
      const statsData = Array.isArray(data) ? data[0] : data;
      
      console.log('getJournalStats - Stats data after handling array:', statsData);
      
      // Map the response field names to our expected field names
      const processedData = {
        total_journals: statsData.total_entries || 0,  // Use total_entries from response
        current_streak: statsData.current_streak || 0
      };
      
      console.log('getJournalStats - Final processed data:', processedData);
      
      return processedData;
    } catch (error) {
      console.error('Error in getJournalStats:', error);
      throw error;
    }
  }

  /**
   * Creates a new journal entry
   * 
   * @param userId The ID of the user creating the journal entry
   * @param data The journal entry data
   * @returns Promise with the created journal entry
   */
  async createJournal(userId: string, data: {
    title: string | null;
    content: string;
    journal_date?: string | null;
    enhanced_version?: string | null;
  }): Promise<{ id: string }> {
    try {
      console.log('createJournal - Creating new journal entry for user:', userId);
      
      const supabase = createSupabaseClient();
      
      // Insert the journal entry
      const { data: result, error } = await supabase
        .from('journals')
        .insert({
          user_id: userId,
          title: data.title,
          content: data.content,
          enhanced_version: data.enhanced_version || null,
          journal_date: data.journal_date || new Date().toISOString(),
        })
        .select('id')
        .single();
      
      if (error) {
        console.error('Error creating journal entry:', error);
        throw error;
      }
      
      console.log('createJournal - Successfully created journal entry:', result);
      
      return { id: result.id };
    } catch (error) {
      console.error('Error in createJournal:', error);
      throw error;
    }
  }

  /**
   * Get tags for a specific journal entry
   * 
   * @param journalId The journal ID to get tags for
   * @returns Promise with array of tag names
   */
  async getJournalEntryTags(journalId: string): Promise<string[]> {
    try {
      console.log('getJournalEntryTags - Fetching tags for journal:', journalId);
      
      const supabase = createSupabaseClient();
      
      const { data, error } = await supabase
        .from('journal_tag')
        .select('tag_id')
        .eq('journal_id', journalId);
      
      if (error) {
        console.error('Error fetching journal tags:', error);
        throw error;
      }
      
      return data?.map((tag: any) => tag.tag_id) || [];
    } catch (error) {
      console.error('Error in getJournalEntryTags:', error);
      throw error;
    }
  }

  /**
   * Save tags for a journal entry
   * 
   * @param journalId The journal ID
   * @param tags Array of tag names
   * @returns Promise with success status
   */
  async saveJournalTags(journalId: string, tags: string[]): Promise<{ success: boolean }> {
    try {
      console.log('saveJournalTags - Saving tags for journal:', journalId, tags);
      
      const supabase = createSupabaseClient();
      
      // First, delete existing tags for this journal
      await supabase
        .from('journal_tag')
        .delete()
        .eq('journal_id', journalId);
      
      // Then insert new tags
      if (tags.length > 0) {
        const tagInserts = tags.map(tag => ({
          journal_id: journalId,
          tag_id: tag
        }));
        
        const { error } = await supabase
          .from('journal_tag')
          .insert(tagInserts);
        
        if (error) {
          console.error('Error inserting journal tags:', error);
          throw error;
        }
      }
      
      console.log('saveJournalTags - Successfully saved tags');
      return { success: true };
    } catch (error) {
      console.error('Error in saveJournalTags:', error);
      throw error;
    }
  }

  /**
   * Updates a journal entry
   * 
   * @param journalId The ID of the journal entry to update
   * @param data The updated journal entry data
   * @returns Promise with success status
   */
  async updateJournal(journalId: string, data: {
    title?: string | null;
    content?: string;
    journal_date?: string | null;
    enhanced_version?: string | null;
  }): Promise<{ success: boolean }> {
    try {
      console.log('updateJournal - Updating journal entry:', journalId);
      
      const supabase = createSupabaseClient();
      
      const { error } = await supabase
        .from('journals')
        .update(data)
        .eq('id', journalId);
      
      if (error) {
        console.error('Error updating journal entry:', error);
        throw error;
      }
      
      console.log('updateJournal - Successfully updated journal entry:', journalId);
      
      return { success: true };
    } catch (error) {
      console.error('Error in updateJournal:', error);
      throw error;
    }
  }

  /**
   * Creates a journal entry from feedback data
   * Saves original content to content field and enhanced version to enhanced_version field
   * 
   * @param userId The ID of the user creating the journal entry
   * @param data The feedback and journal data
   * @returns Promise with the created journal entry
   */
  async createJournalFromFeedback(userId: string, data: {
    title: string;
    originalContent: string;
    enhancedContent: string;
    journalDate: string;
    highlights?: string[];
  }): Promise<{ id: string }> {
    try {
      console.log('createJournalFromFeedback - Creating journal from feedback for user:', userId);
      
      const result = await this.createJournal(userId, {
        title: data.title,
        content: data.originalContent,  // Save original content
        enhanced_version: data.enhancedContent,  // Save enhanced version
        journal_date: data.journalDate,
      });
      
      return result;
    } catch (error) {
      console.error('Error in createJournalFromFeedback:', error);
      throw error;
    }
  }

  /**
   * Deletes a journal entry
   * 
   * @param journalId The ID of the journal entry to delete
   * @returns Promise with success status
   */
  async deleteJournal(journalId: string): Promise<{ success: boolean }> {
    try {
      console.log('deleteJournal - Deleting journal entry:', journalId);
      
      const supabase = createSupabaseClient();
      
      const { error } = await supabase
        .from('journals')
        .delete()
        .eq('id', journalId);
      
      if (error) {
        console.error('Error deleting journal entry:', error);
        throw error;
      }
      
      console.log('deleteJournal - Successfully deleted journal entry:', journalId);
      
      return { success: true };
    } catch (error) {
      console.error('Error in deleteJournal:', error);
      throw error;
    }
  }
}

export const journalService = new JournalService();