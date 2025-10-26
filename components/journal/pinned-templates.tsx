'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/auth/use-auth';
import { Button } from '@/components/ui/button';
import { MinimalTemplateCard } from './minimal-template-card';
import type { PinnedTemplate } from '@/services/api/template-service';

// Local cache
let templateCache: { data: PinnedTemplate[]; timestamp: number; userId: string } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 min

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

  const fallbackTemplates: PinnedTemplate[] = [
    { id: '1', title: 'Morning Reflection', category: 'Journal' },
    { id: '2', title: 'Daily Gratitude', category: 'Journal' },
  ];

  async function loadTemplates() {
    setLoading(true);
    setError(null);

    try {
      const now = Date.now();
      if (
        templateCache &&
        user?.id === templateCache.userId &&
        now - templateCache.timestamp < CACHE_DURATION
      ) {
        setTemplates(templateCache.data);
        setLoading(false);
        return;
      }

      if (!user?.id) {
        setTemplates(fallbackTemplates);
        setError('Người dùng chưa đăng nhập. Hiển thị mẫu mặc định.');
        setLoading(false);
        return;
      }

      const url =
        process.env.NEXT_PUBLIC_GET_PINNED_TEMPLATE_WEBHOOK_URL ||
        'https://n8n.elyandas.com/webhook/get-pinned-template';

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId: user.id }),
      });

      if (!res.ok) throw new Error(`API error ${res.status}`);
      const json = await res.json();

      const data =
        json?.data ||
        json?.templates ||
        (Array.isArray(json) && json[0]?.data) ||
        [];

      const fetched = data.map((t: any) => ({
        id: t.id,
        title: t.name || t.title || 'Untitled',
        category: t.category || 'Journal',
        content: t.content || '',
      }));

      const valid = fetched.length > 0 ? fetched : fallbackTemplates;

      setTemplates(valid);
      templateCache = { data: valid, timestamp: Date.now(), userId: user.id };
    } catch (err) {
      console.error('Template fetch failed:', err);
      setTemplates(fallbackTemplates);
      setError('Không thể tải mẫu. Hiển thị mặc định.');
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

  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      {error && <p className="text-sm text-amber-600 mb-4">{error}</p>}

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

      <div className="flex justify-center">
        <Button
          onClick={handleStart}
          className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-6 py-2"
        >
          {selectedTemplate ? 'Bắt đầu viết với mẫu này →' : 'Viết tự do →'}
        </Button>
      </div>
    </div>
  );
}


