'use client';

import { useAuth } from '@/hooks/auth/use-auth';
import useCachedFetch from '@/hooks/common/use-cached-fetch';
import { journalTemplateService } from '@/services/journal-template-service';

export interface PinnedTemplate {
  id: string;
  title: string;
  category: string;
  content?: string;
}

export async function fetchDefaultTemplates(): Promise<PinnedTemplate[]> {
  try {
    const templates = await journalTemplateService.getDefaultTemplates();
    
    return templates.map(template => ({
      id: template.id || template.name,
      title: template.name,
      category: template.category || 'Daily Reflection',
      content: template.content,
    }));
  } catch (error) {
    console.error('Error fetching default templates:', error);
    
    // Return fallback templates if database query fails
    return [
      { 
        id: 'default-morning-checkin', 
        title: 'Morning Check-in', 
        category: 'Daily Reflection',
        content: '🌅 **Morning Reflection**\n\n**How are you feeling this morning?**\n\n\n**What are you most excited about today?**\n\n\n**What\'s one thing you want to accomplish?**\n\n\n**Gratitude moment - what are you grateful for right now?**\n\n\n---\n*Take a deep breath and set your intention for the day ahead.*'
      },
      { 
        id: 'default-evening-shutdown', 
        title: 'Evening Wind-Down', 
        category: 'Daily Reflection',
        content: '🌙 **Evening Wind Down**\n\n**How did your day go overall?**\n\n\n**What was the highlight of your day?**\n\n\n**What challenged you today and how did you handle it?**\n\n\n**What are you grateful for from today?**\n\n\n**What\'s one thing you learned about yourself?**\n\n\n**Tomorrow, I want to focus on:**\n\n\n---\n*Time to rest and recharge for tomorrow.*'
      },
    ];
  }
}

export function usePinnedTemplates() {
  const { user } = useAuth();

  const fallback: PinnedTemplate[] = [
    { id: 'default-morning-checkin', title: 'Morning Check-in', category: 'Daily Reflection' },
    { id: 'default-evening-shutdown', title: 'Evening Wind-Down', category: 'Daily Reflection' },
  ];

  const { data, loading, error, refresh, clearCache } = useCachedFetch<PinnedTemplate[]>({
    key: `default-templates`,
    duration: 10 * 60 * 1000, // Cache for 10 minutes since these don't change often
    dependencyArray: [], // No dependencies since these are global defaults
    fetcher: fetchDefaultTemplates,
    fallback,
  });

  return { templates: data || fallback, loading, error, refresh, clearCache };
}
