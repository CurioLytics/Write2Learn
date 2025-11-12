'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/auth/use-auth';
import { journalTemplateService } from '@/services/api/journal-template-service';
import { journalFeedbackService } from '@/services/api/journal-feedback-service';
import { journalService } from '@/services/api/journal-service';
import { Button } from '@/components/ui/button';
import { BreathingLoader } from '@/components/ui/breathing-loader';
import { LiveMarkdownEditor } from '@/components/features/journal/editor';
import { formatDateInput } from '@/utils/date-utils';

export default function NewJournalPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();

  // ---- State ----
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const templateId = searchParams?.get('templateId');
  const customContent = searchParams?.get('customContent');
  const isEdit = searchParams?.get('edit') === 'true';
  const entryDate = formatDateInput(new Date());

  // ---- Handle unauthenticated users ----
  useEffect(() => {
    if (!loading && !user) {
      const onboardingData = sessionStorage.getItem('onboardingData');
      if (!onboardingData) router.push('/auth');
    }
  }, [user, loading, router]);

  // ---- Load template or edit data ----
  useEffect(() => {
    if (isEdit) {
      setTitle(localStorage.getItem('editJournalTitle') || '');
      setContent(localStorage.getItem('editJournalContent') || '');
      localStorage.removeItem('editJournalTitle');
      localStorage.removeItem('editJournalContent');
      return;
    }

    if (!templateId) return;
    (async () => {
      try {
        setIsLoading(true);
        const template = await journalTemplateService.getTemplateById(templateId);
        setTitle(template.name || '');
        setContent(customContent ? decodeURIComponent(customContent) : template.content || '');
      } catch {
        setError('Không thể tải mẫu viết.');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [templateId, customContent, isEdit]);

  // ---- Save journal ----
  const handleSave = async () => {
    setError(null);
    setIsLoading(true);

    try {
      if (user) {
        const result = await journalService.createJournal(user.id, {
          title,
          content,
          journal_date: entryDate,
        });
        router.push(`/journal/${result.id}`);
      } else {
        const offlineEntry = {
          id: `offline-${Date.now()}`,
          title,
          content,
          entryDate,
          createdAt: new Date().toISOString(),
        };
        const saved = JSON.parse(localStorage.getItem('offlineJournalEntries') || '[]');
        saved.push(offlineEntry);
        localStorage.setItem('offlineJournalEntries', JSON.stringify(saved));
        router.push('/auth?message=journal_saved');
      }
    } catch {
      setError('Không thể lưu nhật ký.');
    } finally {
      setIsLoading(false);
    }
  };

  // ---- Get feedback ----
  const handleGetFeedback = async () => {
    if (!content.trim()) return setError('Vui lòng viết nội dung trước.');

    setIsLoading(true);
    setError(null);

    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-black/30 flex items-center justify-center text-white text-lg z-50';
    overlay.innerText = 'Getting feedback...';
    document.body.appendChild(overlay);

    try {
      const result = await journalFeedbackService.getFeedback(content, title);
      
      if (overlay.parentNode) {
        document.body.removeChild(overlay);
      }

      if (result.success && result.data) {
        // Use the properly structured data from the service
        router.push(`/journal/feedback?feedback=${encodeURIComponent(JSON.stringify(result.data))}`);
      } else {
        // Show the actual error message
        const errorMessage = result.error?.message || 'Unknown error occurred';
        setError(`Feedback service error: ${errorMessage}`);
        console.error('Feedback service error:', result.error);
      }
    } catch (error) {
      if (overlay.parentNode) {
        document.body.removeChild(overlay);
      }
      
      console.error('Unexpected error in handleGetFeedback:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`Unexpected error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  // ---- Loading ----
  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <BreathingLoader message="Đang tải trang viết..." />
      </div>
    );
  }

  // ---- UI ----
  return (
    <div
      className="min-h-screen flex flex-col bg-white px-6 py-8"
      style={{ fontFamily: 'var(--font-sans)', color: 'var(--foreground)' }}
    >
      <main className="max-w-3xl w-full mx-auto flex flex-col flex-grow">
        {/* Header row */}
        <div className="flex items-start justify-between mb-6">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Tiêu đề..."
            className="text-3xl font-semibold focus:outline-none placeholder-gray-400 bg-transparent w-full text-left"
          />
          <Button
            onClick={handleSave}
            variant="default"
            className="ml-4 bg-gray-900 hover:bg-gray-800 text-white rounded-full px-6 py-2 shadow-md whitespace-nowrap"
          >
            Lưu
          </Button>
        </div>

        {/* Content */}
        <LiveMarkdownEditor
          value={content}
          onChange={setContent}
          placeholder="Bắt đầu viết ở đây..."
          minHeight={400}
        />

        {/* Error */}
        {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}

        {/* Footer buttons */}
        <div className="flex justify-end mt-8 gap-3">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="rounded-full text-gray-700 hover:bg-gray-50"
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
