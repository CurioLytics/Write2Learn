'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { MinimalTemplateCard } from './minimal-template-card';
import { usePinnedTemplates, PinnedTemplate } from '@/services/client/template-service';

interface PinnedTemplatesProps {
  limit?: number;
}

export function PinnedTemplates({ limit = 4 }: PinnedTemplatesProps) {
  const router = useRouter();
  const { templates, loading, error } = usePinnedTemplates();
  const [selectedTemplate, setSelectedTemplate] = useState<PinnedTemplate | null>(null);

  const handleTemplateClick = (template: PinnedTemplate) =>
    setSelectedTemplate(selectedTemplate?.id === template.id ? null : template);

  const handleStartWriting = () => {
    const path = selectedTemplate
      ? `/journal/new?templateId=${selectedTemplate.id}`
      : '/journal/new';
    router.push(path);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-5">
      {error && (
        <div className="mb-4 text-sm text-amber-600 bg-amber-50 p-2 rounded">
          {String(error)}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
        {templates.slice(0, limit).map((t) => (
          <MinimalTemplateCard
            key={t.id}
            template={t}
            onClick={() => handleTemplateClick(t)}
            isSelected={selectedTemplate?.id === t.id}
          />
        ))}
      </div>

      {selectedTemplate && (
        <div className="flex flex-col items-center mb-4">
          <p className="text-xs text-gray-500 text-center">
            Template content will be automatically loaded in the editor
          </p>
          <button
            onClick={() => setSelectedTemplate(null)}
            className="mt-2 text-xs text-blue-600 hover:text-blue-800 hover:underline"
          >
            Clear selection
          </button>
        </div>
      )}

      <div className="flex justify-center">
        <Button
          className={`flex items-center ${
            selectedTemplate
              ? 'bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 text-sm rounded-md font-normal'
              : 'bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-base rounded-md font-medium'
          }`}
          onClick={handleStartWriting}
        >
          {selectedTemplate ? (
            <span>
              Start with this template <span className="ml-1">→</span>
            </span>
          ) : (
            <span>
              Start with blank page <span className="ml-1">→</span>
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
