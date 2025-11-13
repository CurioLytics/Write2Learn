import { createSupabaseClient } from '@/services/supabase/auth-helpers';
import { JournalTemplate } from '@/types/journal';
import { SUPABASE_CONFIG } from '@/config/supabase';

/**
 * Service for fetching and managing journal templates
 */
class JournalTemplateService {
  /**
   * Get templates for a specific user
   * @param userId The user ID to fetch templates for
   * @returns Promise with user's templates
   */
  async getTemplatesByUserId(userId: string): Promise<JournalTemplate[]> {
    try {
      const supabase = createSupabaseClient();
      
      const { data, error } = await supabase
        .from(SUPABASE_CONFIG.tables.templates)
        .select('profile_id, name, content, cover_image')
        .eq('profile_id', userId)
        .order('name');
      
      if (error) {
        console.error('Error fetching journal templates:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getTemplatesByUserId:', error);
      throw error;
    }
  }

  /**
   * Get a specific template by name for a user
   * @param userId The user ID
   * @param templateName The template name
   * @returns Promise with the template or null if not found
   */
  async getTemplateByName(userId: string, templateName: string): Promise<JournalTemplate | null> {
    try {
      const supabase = createSupabaseClient();
      
      const { data, error } = await supabase
        .from(SUPABASE_CONFIG.tables.templates)
        .select('profile_id, name, content, cover_image')
        .eq('profile_id', userId)
        .eq('name', decodeURIComponent(templateName))
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') { // No rows returned
          return null;
        }
        console.error('Error fetching journal template by name:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error in getTemplateByName:', error);
      throw error;
    }
  }

  /**
   * Fetch all available journal templates
   * @returns Promise with all templates
   */
  async getAllTemplates(): Promise<JournalTemplate[]> {
    try {
      const supabase = createSupabaseClient();
      
      const { data, error } = await supabase
        .from(SUPABASE_CONFIG.tables.templates)
        .select('profile_id, name, content, cover_image')
        .order('name');
      
      if (error) {
        console.error('Error fetching all journal templates:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getAllTemplates:', error);
      throw error;
    }
  }
}

export const journalTemplateService = new JournalTemplateService();