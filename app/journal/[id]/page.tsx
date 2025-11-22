'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/auth/use-auth';
import { useJournalAutosave } from '@/hooks/journal/use-journal-autosave';
import { journalService } from '@/services/journal-service';
import { journalFeedbackService } from '@/services/journal-feedback-service';
import { Button } from '@/components/ui/button';
import { JournalEditorLayout } from '@/components/journal/journal-editor-layout';
import { formatDateInput } from '@/utils/date-utils';

export default function JournalEditPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const journalId = params?.id as string;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [journalDate, setJournalDate] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const autoSave = async () => {
    if (!journalId || !title || !content) return;
    
    try {
      await journalService.updateJournal(journalId, {
        title,
        content,
        journal_date: journalDate,
      });
      await journalService.saveJournalTags(journalId, tags);
    } catch (err) {
      console.error('Auto-save failed:', err);
    }
  };

  const { clearDraft } = useJournalAutosave({
    title,
    content,
    journalDate,
    tags,
    journalId,
    onSave: autoSave,
    draftKey: `journal_edit_${journalId}`
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchJournal = async () => {
      if (!journalId || !user) return;

      try {
        setIsLoading(false);
        const journals = await journalService.getJournals(user.id);
        const journalData = journals.find(j => j.id === journalId);
        
        if (!journalData) {
          setError('Journal not found');
          return;
        }
        
        const journalTags = await journalService.getJournalEntryTags(journalId);
        
        setTitle(journalData.title || '');
        setContent(journalData.content || '');
        setJournalDate(journalData.journal_date || formatDateInput(new Date()));
        setTags(journalTags);
      } catch (error) {
        console.error('Error fetching journal:', error);
        setError('Không thể tải nhật ký. Vui lòng thử lại.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchJournal();
  }, [journalId, user]);

  const handleSave = async () => {
    if (!journalId || !user) return;

    setError(null);
    setIsLoading(true);

    try {
      await journalService.updateJournal(journalId, {
        title,
        content,
        journal_date: journalDate,
      });
      
      if (tags.length > 0) {
        await journalService.saveJournalTags(journalId, tags);
      }
      
      clearDraft();
      router.push('/journal');
    } catch (error) {
      console.error('Error updating journal:', error);
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
    try {
      await journalService.deleteJournal(journalId);
      clearDraft();
      router.push('/journal');
    } catch (error) {
      setError('Không thể xóa nhật ký');
    }
  };

  const handleVoiceTranscript = (text: string, isFinal: boolean) => {
    // No additional logic needed here, the layout handles it
  };

  if (error && !content) {
    return (
      <div className="flex flex-col items-center justify-center bg-white px-6 py-20">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Không thể tải nhật ký</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/journal">
            <Button>Quay lại danh sách</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <JournalEditorLayout
      title={title}
      content={content}
      journalDate={journalDate}
      tags={tags}
      journalId={journalId}
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
