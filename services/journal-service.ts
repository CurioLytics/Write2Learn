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
        journal_date: journal.journal_date ?? journal.created_at ?? new Date().toISOString()
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
}

export const journalService = new JournalService();