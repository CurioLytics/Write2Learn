'use client';

import { useAuth } from '@/hooks/auth/use-auth';
import useCachedFetch from '@/hooks/common/use-cached-fetch';

export interface PinnedTemplate {
  id: string;
  title: string;
  category: string;
  content?: string;
}

interface ApiTemplateResponse {
  data?: {
    id: string;
    name: string;
    content: string;
    category?: string;
  }[];
}

export async function fetchPinnedTemplates(profileId: string): Promise<PinnedTemplate[]> {
  try {
    // Use webhook URL from env or fallback to hardcoded URL
    const webhookUrl = typeof process !== 'undefined' && process.env.GET_PINNED_TEMPLATE_WEBHOOK_URL 
      ? process.env.GET_PINNED_TEMPLATE_WEBHOOK_URL
      : 'https://n8n.elyandas.com/webhook/get-pinned-template';
      
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileId }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch pinned templates: ${response.status}`);
    }

    const responseData = await response.json();

    if (Array.isArray(responseData) && responseData.length > 0 && responseData[0].data) {
      return responseData[0].data.map((t: any) => ({
        id: t.id,
        title: t.name,
        category: t.category || determineCategory(t.name),
        content: t.content,
      }));
    }

    if (responseData.data && Array.isArray(responseData.data)) {
      return responseData.data.map((t: any) => ({
        id: t.id,
        title: t.name,
        category: t.category || determineCategory(t.name),
        content: t.content,
      }));
    }

    if (responseData.templates && Array.isArray(responseData.templates)) {
      return responseData.templates;
    }

    return [];
  } catch (error) {
    console.error('Error fetching pinned templates:', error);
    throw error;
  }
}

function determineCategory(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('reflection') || lower.includes('journal')) return 'Journaling';
  if (lower.includes('goal') || lower.includes('task')) return 'Productivity';
  if (lower.includes('learn') || lower.includes('study')) return 'Learning';
  return 'General';
}

export function usePinnedTemplates() {
  const { user } = useAuth();

  const fallback: PinnedTemplate[] = [
    { id: '1', title: 'Morning Check-in', category: 'Journaling' },
    { id: '2', title: 'Minimalism Prompt', category: 'Productivity' },
  ];

  const { data, loading, error, refresh, clearCache } = useCachedFetch<PinnedTemplate[]>({
    key: `pinned-templates-${user?.id || 'anonymous'}`,
    duration: 5 * 60 * 1000,
    dependencyArray: [user?.id],
    fetcher: async () => (!user?.id ? fallback : fetchPinnedTemplates(user.id)),
    fallback,
  });

  return { templates: data || fallback, loading, error, refresh, clearCache };
}
