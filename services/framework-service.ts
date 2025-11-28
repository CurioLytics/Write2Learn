import { createSupabaseClient } from '@/services/supabase/auth-helpers';

export interface FrameworkCategory {
  name: string;
  description: string | null;
  image_cover: string | null;
}

export interface Framework {
  name: string;
  content: string;
  description?: string | null;
  category: string;
}

class FrameworkService {
  /**
   * Get all framework categories
   */
  async getCategories(): Promise<FrameworkCategory[]> {
    try {
      const supabase = createSupabaseClient();
      
      const { data, error } = await supabase
        .from('framework_category')
        .select('name, description, image_cover')
        .order('name');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching framework categories:', error);
      throw error;
    }
  }

  /**
   * Get all frameworks
   */
  async getFrameworks(): Promise<Framework[]> {
    try {
      const supabase = createSupabaseClient();
      
      const { data, error } = await supabase
        .from('frameworks')
        .select('name, content, description, category')
        .order('name');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching frameworks:', error);
      throw error;
    }
  }

  /**
   * Get frameworks by category
   */
  async getFrameworksByCategory(category: string): Promise<Framework[]> {
    try {
      const supabase = createSupabaseClient();
      
      const { data, error } = await supabase
        .from('frameworks')
        .select('name, content, description, category')
        .eq('category', category)
        .order('name');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching frameworks by category:', error);
      throw error;
    }
  }
}

export const frameworkService = new FrameworkService();