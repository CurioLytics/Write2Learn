'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/auth/use-auth';
import { Button } from '@/components/ui/button';
import { MinimalTemplateCard } from './minimal-template-card';
import { pinnedTemplatesService, type PinnedTemplate } from '@/services/supabase/pinned-templates-service';

interface PinnedTemplatesProps {
  limit?: number;
}

export function PinnedTemplates({ limit = 4 }: PinnedTemplatesProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [templates, setTemplates] = useState<PinnedTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<PinnedTemplate | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadTemplates() {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await pinnedTemplatesService.getPinnedTemplates(user.id);
      setTemplates(data);
    } catch (err) {
      console.error('Failed to load pinned templates:', err);
      setError('Failed to load templates');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTemplates();
  }, [user?.id]);

  const handleSelect = (template: PinnedTemplate) => {
    setSelectedTemplate((prev) => (prev?.id === template.id ? null : template));
  };

  const handleStart = () => {
    router.push(
      selectedTemplate
        ? `/journal/new?templateId=${selectedTemplate.id}`
        : '/journal/new'
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin h-6 w-6 border-b-2 border-emerald-600 rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {templates.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No pinned templates</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          {templates.slice(0, limit).map((template) => (
            <MinimalTemplateCard
              key={template.id}
              template={template}
              onClick={() => handleSelect(template)}
              isSelected={selectedTemplate?.id === template.id}
            />
          ))}
        </div>
      )}

      <div className="flex justify-center">
        <Button
          onClick={handleStart}
          className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-6 py-2"
        >
          {selectedTemplate ? 'Start with template →' : 'Free writing →'}
        </Button>
      </div>
    </div>
  );
}


