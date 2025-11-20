'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/auth/use-auth';
import { useJournalAutosave } from '@/hooks/journal/use-journal-autosave';
import { journalTemplateService } from '@/services/journal-template-service';
import { journalFeedbackService } from '@/services/journal-feedback-service';
import { journalService } from '@/services/journal-service';
import { Button } from '@/components/ui/button';
import { BreathingLoader } from '@/components/ui/breathing-loader';
import { LiveMarkdownEditor } from '@/components/features/journal/editor';
import { JournalActionsMenu } from '@/components/journal/journal-actions-menu';
import { formatDateInput } from '@/utils/date-utils';

export default function NewJournalPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [journalDate, setJournalDate] = useState(formatDateInput(new Date()));
  const [tags, setTags] = useState<string[]>([]);
  const [journalId, setJournalId] = useState<string | null>(null);

  const templateName = searchParams?.get('templateName');
  const customContent = searchParams?.get('customContent');
  const isEdit = searchParams?.get('edit') === 'true';

  const autoSave = async () => {
    if (!user || !title || !content) return;
    
    try {
      if (journalId) {
        await journalService.updateJournal(journalId, {
          title,
          content,
          journal_date: journalDate,
        });
        await journalService.saveJournalTags(journalId, tags);
      } else {
        const result = await journalService.createJournal(user.id, {
          title,
          content,
          journal_date: journalDate,
        });
        if (tags.length > 0) {
          await journalService.saveJournalTags(result.id, tags);
        }
        setJournalId(result.id);
      }
    } catch (err) {
      console.error('Auto-save failed:', err);
    }
  };

  const { loadDraft, clearDraft } = useJournalAutosave({
    title,
    content,
    journalDate,
    tags,
    journalId,
    onSave: autoSave
  });

  // Redirect unauthenticated users
  useEffect(() => {
    if (!loading && !user && !sessionStorage.getItem('onboardingData')) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  // Load template, edit data, or draft
  useEffect(() => {
    if (isEdit) {
      setTitle(localStorage.getItem('editJournalTitle') || '');
      setContent(localStorage.getItem('editJournalContent') || '');
      localStorage.removeItem('editJournalTitle');
      localStorage.removeItem('editJournalContent');
      return;
    }

    if (customContent) {
      setContent(decodeURIComponent(customContent));
      if (templateName) setTitle(templateName);
      return;
    }

    if (templateName) {
      setTitle(templateName);
      return;
    }

    // Load draft for new journal
    const draft = loadDraft();
    if (draft) {
      setTitle(draft.title || '');
      setContent(draft.content || '');
      setJournalDate(draft.journalDate || formatDateInput(new Date()));
      setTags(draft.tags || []);
    }
  }, [templateName, customContent, isEdit, loadDraft]);

  const handleSave = async () => {
    setError(null);
    setIsLoading(true);

    try {
      if (user) {
        if (journalId) {
          // Update existing journal
          await journalService.updateJournal(journalId, {
            title,
            content,
            journal_date: journalDate,
          });
        } else {
          // Create new journal
          const result = await journalService.createJournal(user.id, {
            title,
            content,
            journal_date: journalDate,
          });
          
          // Save tags to journal_tag table if any
          if (tags.length > 0) {
            await journalService.saveJournalTags(result.id, tags);
          }
          
          setJournalId(result.id);
        }
        clearDraft(); // Clear draft on save
        router.push('/journal');
      } else {
        const offlineEntry = {
          id: `offline-${Date.now()}`,
          title,
          content,
          entryDate: journalDate,
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

  const handleDelete = async () => {
    if (!journalId) return;
    
    try {
      await journalService.deleteJournal(journalId);
      router.push('/journal');
    } catch (error) {
      setError('Không thể xóa nhật ký');
    }
  };



  return (
    <div className="bg-white px-6 py-8">
      <main className="max-w-3xl w-full mx-auto flex flex-col">
        {/* Header with navigation and actions */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/journal" className="text-blue-600 text-sm hover:underline">
            ⬅ Back to Journal
          </Link>
          <div className="flex items-center gap-3">
            <JournalActionsMenu
              journalId={journalId || undefined}
              currentDate={journalDate}
              currentTags={tags}
              onDateChange={setJournalDate}
              onTagsChange={setTags}
              onDelete={handleDelete}
            />
                        <Button
              onClick={handleSave}
              variant="outline"
            >
              Lưu
            </Button>
            <Button
              onClick={handleGetFeedback}
              disabled={!content || !title}
            >
              Nhận phản hồi
            </Button>
          </div>
        </div>

        {/* Title input */}
        <div className="mb-6">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Tiêu đề..."
            className="text-3xl font-semibold focus:outline-none placeholder-gray-400 bg-transparent w-full"
          />
        </div>

        <LiveMarkdownEditor
          value={content}
          onChange={setContent}
          placeholder="Bắt đầu viết ở đây..."
          minHeight={400}
        />

        {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}

        {/* Show breathing loader during feedback processing */}
        {isLoading && (
          <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <BreathingLoader 
              message="Getting personalized feedback..."
              className="bg-white rounded-lg shadow-lg p-8"
            />
          </div>
        )}

      </main>
    </div>
  );
}
