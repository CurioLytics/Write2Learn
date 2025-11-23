'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/auth/use-auth';
import { useJournalAutosave } from '@/hooks/journal/use-journal-autosave';
import { journalFeedbackService } from '@/services/journal-feedback-service';
import { journalService } from '@/services/journal-service';
import { JournalEditorLayout } from '@/components/journal/journal-editor-layout';
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

  useEffect(() => {
    if (!loading && !user && !sessionStorage.getItem('onboardingData')) {
      router.push('/auth');
    }
  }, [user, loading, router]);

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
          await journalService.updateJournal(journalId, {
            title,
            content,
            journal_date: journalDate,
          });
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
        clearDraft();
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
        // Store feedback in sessionStorage for cleaner URL
        sessionStorage.setItem('journalFeedback', JSON.stringify(result.data));
        router.push('/journal/feedback');
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

  const handleVoiceTranscript = (text: string, isFinal: boolean) => {
    // No additional logic needed here, the layout handles it
  };

  return (
    <JournalEditorLayout
      title={title}
      content={content}
      journalDate={journalDate}
      tags={tags}
      journalId={journalId || undefined}
      isLoading={isLoading}
      error={error}
      onTitleChange={setTitle}
      onContentChange={setContent}
      onDateChange={setJournalDate}
      onTagsChange={setTags}
      onSave={handleSave}
      onGetFeedback={handleGetFeedback}
      onDelete={handleDelete}
      onVoiceTranscript={handleVoiceTranscript}
    />
  );
}
