'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/auth/use-auth';
import { journalTemplateService } from '@/services/journal-template-service';
import { journalFeedbackService } from '@/services/journal-feedback-service';
import { journalService } from '@/services/journal-service';
import { Button } from '@/components/ui/button';
import { BreathingLoader } from '@/components/ui/breathing-loader';
import { LiveMarkdownEditor } from '@/components/features/journal/editor';
import { formatDateInput } from '@/utils/date-utils';

export default function NewJournalPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const templateName = searchParams?.get('templateName');
  const customContent = searchParams?.get('customContent');
  const isEdit = searchParams?.get('edit') === 'true';

  // Redirect unauthenticated users
  useEffect(() => {
    if (!loading && !user && !sessionStorage.getItem('onboardingData')) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  // Load template or edit data
  useEffect(() => {
    if (isEdit) {
      setTitle(localStorage.getItem('editJournalTitle') || '');
      setContent(localStorage.getItem('editJournalContent') || '');
      localStorage.removeItem('editJournalTitle');
      localStorage.removeItem('editJournalContent');
      return;
    }

    // If we have custom content from template, use it directly
    if (customContent) {
      setContent(decodeURIComponent(customContent));
      if (templateName) {
        setTitle(templateName);
      }
      return;
    }

    // Legacy support: if only templateName is provided without customContent
    if (templateName && !customContent) {
      // Just set a default title, no content loading needed
      setTitle(templateName);
    }
  }, [templateName, customContent, isEdit]);

  const handleSave = async () => {
    setError(null);
    setIsLoading(true);

    try {
      if (user) {
        const result = await journalService.createJournal(user.id, {
          title,
          content,
          journal_date: formatDateInput(new Date()),
        });
        router.push(`/journal/${result.id}`);
      } else {
        const offlineEntry = {
          id: `offline-${Date.now()}`,
          title,
          content,
          entryDate: formatDateInput(new Date()),
          createdAt: new Date().toISOString(),
        };
        const saved = JSON.parse(localStorage.getItem('offlineJournalEntries') || '[]');
        saved.push(offlineEntry);
        localStorage.setItem('offlineJournalEntries', JSON.stringify(saved));
        router.push('/auth?message=journal_saved');
      }
    } catch {
      setError('Không thể lưu nhật ký');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetFeedback = async () => {
    if (!content.trim()) return setError('Vui lòng viết nội dung trước');

    setIsLoading(true);
    setError(null);

    try {
      const result = await journalFeedbackService.getFeedback(content, title);

      if (result.success && result.data) {
        router.push(`/journal/feedback?feedback=${encodeURIComponent(JSON.stringify(result.data))}`);
      } else {
        setError(`Lỗi phản hồi: ${result.error?.message || 'Lỗi không xác định'}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      setError(`Lỗi: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <BreathingLoader message="Đang tải..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white px-6 py-8">
      <main className="max-w-3xl w-full mx-auto flex flex-col flex-grow">
        <div className="flex items-start justify-between mb-6">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Tiêu đề..."
            className="text-3xl font-semibold focus:outline-none placeholder-gray-400 bg-transparent w-full"
          />
          <Button
            onClick={handleSave}
            className="ml-4 bg-gray-900 hover:bg-gray-800 text-white rounded-full px-6 py-2"
          >
            Lưu
          </Button>
        </div>

        <LiveMarkdownEditor
          value={content}
          onChange={setContent}
          placeholder="Bắt đầu viết ở đây..."
          minHeight={400}
        />

        {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}

        <div className="flex justify-end mt-8 gap-3">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="rounded-full"
          >
            Hủy
          </Button>
          <Button
            onClick={handleGetFeedback}
            disabled={!content || !title}
            className="rounded-full bg-gray-900 hover:bg-gray-800 text-white px-6"
          >
            Nhận phản hồi
          </Button>
        </div>
      </main>
    </div>
  );
}
