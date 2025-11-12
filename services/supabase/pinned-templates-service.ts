import { supabase } from '@/services/supabase/client';

export interface PinnedTemplate {
  id: string;
  name: string;
  category: string;
  content: string;
  tag?: string[];
}

export class PinnedTemplatesService {
  async getPinnedTemplates(userId: string): Promise<PinnedTemplate[]> {
    try {
      console.log('Fetching pinned templates for user:', userId);
      
      // Get user's pinned template IDs
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('pinned_template_ids')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Profile query error:', profileError);
        throw new Error(`Cannot access user profile: ${profileError.message}`);
      }

      console.log('Profile data:', profile);

      const pinnedIds = (profile as any)?.pinned_template_ids || [];
      console.log('Pinned template IDs:', pinnedIds);
      
      if (pinnedIds.length === 0) {
        console.log('No pinned templates found');
        return [];
      }

      // Get the actual templates
      const { data: templates, error: templatesError } = await supabase
        .from('journal_template')
        .select('id, name, category, content, tag')
        .in('id', pinnedIds);

      if (templatesError) {
        console.error('Templates query error:', templatesError);
        throw new Error(`Cannot fetch templates: ${templatesError.message}`);
      }

      console.log('Templates data:', templates);

      const result = (templates || []).map((template: any) => ({
        id: template.id,
        name: template.name,
        category: template.category || 'Journaling',
        content: template.content || '',
        tag: template.tag || []
      }));

      console.log('Processed templates:', result);
      return result;

    } catch (error) {
      console.error('Error fetching pinned templates:', error);
      throw error;
    }
  }
}

export const pinnedTemplatesService = new PinnedTemplatesService();