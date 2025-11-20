'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/auth/use-auth';
import { useJournalAutosave } from '@/hooks/journal/use-journal-autosave';
import { journalService } from '@/services/journal-service';
import { FloatingVoiceButton } from '@/components/journal/floating-voice-button';
import { journalFeedbackService } from '@/services/journal-feedback-service';
import { Button } from '@/components/ui/button';
import { BreathingLoader } from '@/components/ui/breathing-loader';
import { LiveMarkdownEditor } from '@/components/features/journal/editor';
import { JournalActionsMenu } from '@/components/journal/journal-actions-menu';
import { formatDateInput } from '@/utils/date-utils';
import type { Journal } from '@/types/journal';

export default function JournalViewPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const journalId = params?.id as string;

  const [journal, setJournal] = useState<Journal | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [journalDate, setJournalDate] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
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

  useJournalAutosave({
    title,
    content,
    journalDate,
    tags,
    journalId,
    onSave: autoSave,
    draftKey: `journal_edit_${journalId}`
  });

  // Redirect unauthenticated users
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  // Load journal data
  useEffect(() => {
    const fetchJournal = async () => {
      if (!journalId || !user) return;

      try {
        setIsLoading(true);
        setError(null);
        
        // Get all journals and find the specific one
        const journals = await journalService.getJournals(user.id);
        const journalData = journals.find(j => j.id === journalId);
        
        if (!journalData) {
          throw new Error('Journal not found');
        }
        
        // Load tags for this journal
        const journalTags = await journalService.getJournalEntryTags(journalId);
        
        setJournal(journalData);
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
    if (!journalId) return;

    setError(null);
    setIsSaving(true);

    try {
      // Update journal content
      await journalService.updateJournal(journalId, {
        title,
        content,
        journal_date: journalDate,
      });
      
      // Save tags to journal_tag table
      await journalService.saveJournalTags(journalId, tags);
      
      // Redirect back to journal list like in journal/new
      router.push('/journal');
    } catch (error) {
      console.error('Error updating journal:', error);
      setError('Không thể lưu nhật ký');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGetFeedback = async () => {
    if (!content.trim()) return setError('Vui lòng viết nội dung trước');

    setIsSaving(true);
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
      setIsSaving(false);
    }
  };

  const handleDateChange = (newDate: string) => {
    setJournalDate(newDate);
  };

  const handleTagsChange = (newTags: string[]) => {
    setTags(newTags);
  };

  const handleDelete = async () => {
    try {
      await journalService.deleteJournal(journalId);
      router.push('/journal');
    } catch (error) {
      setError('Không thể xóa nhật ký');
    }
  };

  const handleVoiceTranscript = (text: string) => {
    setContent(prev => prev ? `${prev} ${text}` : text);
  };

  // Show error state
  if (error && !journal) {
    return (
      <div className="flex flex-col items-center justify-center bg-white px-6 py-20">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Không thể tải nhật ký</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/journal">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Quay lại danh sách
            </Button>
          </Link>
        </div>
      </div>
    );
  }

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
              journalId={journalId}
              currentDate={journalDate}
              currentTags={tags}
              onDateChange={handleDateChange}
              onTagsChange={handleTagsChange}
              onDelete={handleDelete}
            />
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-6 py-2"
            >
              {isSaving ? 'Saving...' : 'Save'}
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

        {/* Date and Tags display */}
        <div className="flex items-center gap-4 mb-6 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <span>📅</span>
            <span>{new Date(journalDate).toLocaleDateString('vi-VN')}</span>
          </div>
          {tags.length > 0 && (
            <div className="flex items-center gap-2">
              <span>🏷️</span>
              <div className="flex flex-wrap gap-1">
                {tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <LiveMarkdownEditor
          value={content}
          onChange={setContent}
          placeholder="Bắt đầu viết ở đây..."
          minHeight={400}
        />

        {error && (
          <p className="text-red-500 text-sm mt-4 text-center">{error}</p>
        )}

        <div className="flex justify-center mt-8">
          <Button
            onClick={handleGetFeedback}
            disabled={!content || !title || isSaving}
          >
            Nhận phản hồi
          </Button>
        </div>

        {/* Show breathing loader during feedback processing */}
        {isSaving && (
          <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <BreathingLoader 
              message="Getting personalized feedback..."
              className="bg-white rounded-lg shadow-lg p-8"
            />
          </div>
        )}
      </main>
      <FloatingVoiceButton onTranscript={handleVoiceTranscript} />
    </div>
  );
}