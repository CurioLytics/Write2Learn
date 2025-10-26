'use client';

import React from 'react';
import type { JournalTemplate } from '@/types/journal';

interface TemplateCardProps {
  template: JournalTemplate;
  selected: boolean;
  onSelect: () => void;
}

function TemplateCard({ template, selected, onSelect }: TemplateCardProps) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-5 rounded-xl border transition-all duration-200 
        ${selected
          ? 'border-emerald-500 bg-emerald-50'
          : 'border-gray-200 hover:border-emerald-200 hover:bg-gray-50'
        }`}
    >
      <div className="flex flex-col">
        <h3 className="text-base font-semibold text-gray-900 tracking-tight">
          {template.name}
        </h3>
        <p className="text-sm text-gray-600 mt-2 leading-relaxed">
          {template.content?.substring(0, 100)}
          {template.content && template.content.length > 100 ? '…' : ''}
        </p>
      </div>
    </button>
  );
}

interface TemplateSelectionStepProps {
  selectedTemplates: string[];
  onToggleTemplate: (templateId: string) => void;
}

export function TemplateSelectionStep({
  selectedTemplates,
  onToggleTemplate,
}: TemplateSelectionStepProps) {
  const [templates, setTemplates] = React.useState<JournalTemplate[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchTemplates() {
      try {
        const response = await fetch('/api/journal-templates');
        if (!response.ok) throw new Error('Không thể tải mẫu nhật ký.');

        const data = await response.json();
        setTemplates(data.templates || []);
      } catch (err) {
        console.error('Lỗi khi tải mẫu nhật ký:', err);
        setError('Không thể tải danh sách mẫu. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    }

    fetchTemplates();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mb-3"></div>
        <p className="text-sm text-gray-600">Đang tải các mẫu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-red-600 mb-3 text-sm">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="text-sm text-emerald-600 font-medium hover:underline"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900">
          Chọn Mẫu Nhật Ký
        </h2>
        <p className="text-gray-600 mt-2 text-sm">
          Hãy chọn một mẫu gợi ý hoặc bắt đầu viết nhật ký của riêng bạn.
        </p>
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-8 text-gray-500 text-sm">
          Hiện chưa có mẫu nào khả dụng. Vui lòng quay lại sau.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              selected={selectedTemplates.includes(template.id)}
              onSelect={() => onToggleTemplate(template.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
