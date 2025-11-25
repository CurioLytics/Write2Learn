'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/auth/use-auth';
import { journalService } from '@/services/journal-service';
import { journalFeedbackService } from '@/services/journal-feedback-service';
import { Button } from '@/components/ui/button';
import { JournalEditorLayout } from '@/components/journal/journal-editor-layout';
import { formatDateInput } from '@/utils/date-utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function JournalEditPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const journalId = params?.id as string;
  const hasLoadedData = useRef(false);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [journalDate, setJournalDate] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGettingFeedback, setIsGettingFeedback] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialTitle, setInitialTitle] = useState('');
  const [initialContent, setInitialContent] = useState('');
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  // Check if there are unsaved changes
  const hasUnsavedChanges = useCallback(() => {
    return (title !== initialTitle || content !== initialContent) && (title || content);
  }, [title, content, initialTitle, initialContent]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  // Warn on unsaved changes when trying to leave page
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges()) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  useEffect(() => {
    const fetchJournal = async () => {
      if (!journalId || !user || hasLoadedData.current) return;

      try {
        // Check if loading draft from feedback page
        const draftJson = sessionStorage.getItem('journalDraft');
        if (draftJson) {
          try {
            const draft = JSON.parse(draftJson);
            console.log('Loading journal draft:', draft);
            
            // Verify this draft belongs to current journal
            if (draft.journalId === journalId) {
              setTitle(draft.title || '');
              setContent(draft.content || '');
              setInitialTitle(draft.title || '');
              setInitialContent(draft.content || '');
              setJournalDate(draft.journalDate || formatDateInput(new Date()));
              setTags(draft.tags || []);
              
              sessionStorage.removeItem('journalDraft');
              hasLoadedData.current = true;
              setIsLoadingData(false);
              return;
            }
          } catch (e) {
            console.error('Failed to parse journal draft:', e);
          }
        }

        // Normal flow: fetch from database
        const journals = await journalService.getJournals(user.id);
        const journalData = journals.find(j => j.id === journalId);
        
        if (!journalData) {
          setError('Journal not found');
          hasLoadedData.current = true;
          return;
        }
        
        const journalTags = await journalService.getJournalEntryTags(journalId);
        
        const loadedTitle = journalData.title || '';
        const loadedContent = journalData.content || '';
        setTitle(loadedTitle);
        setContent(loadedContent);
        setInitialTitle(loadedTitle);
        setInitialContent(loadedContent);
        setJournalDate(journalData.journal_date || formatDateInput(new Date()));
        setTags(journalTags);
        hasLoadedData.current = true;
      } catch (error) {
        console.error('Error fetching journal:', error);
        setError('Không thể tải nhật ký. Vui lòng thử lại.');
        hasLoadedData.current = true;
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchJournal();
  }, [journalId, user]);

  const handleSave = async () => {
    if (!journalId || !user) return;

    setError(null);
    setIsSaving(true);

    try {
      await journalService.updateJournal(journalId, {
        title,
        content,
        journal_date: journalDate,
      });
      
      if (tags.length > 0) {
        await journalService.saveJournalTags(journalId, tags);
      }
      
      // Mark as saved by updating initial values
      setInitialTitle(title);
      setInitialContent(content);
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

    setIsGettingFeedback(true);
    setError(null);

    try {
      const result = await journalFeedbackService.getFeedback(content, title);

      if (result.success && result.data) {
        // Store BOTH draft and feedback for recovery when clicking "Sửa"
        const journalDraft = {
          title,
          content,
          journalDate,
          tags,
          journalId,
          timestamp: Date.now()
        };
        sessionStorage.setItem('journalDraft', JSON.stringify(journalDraft));
        sessionStorage.setItem('journalFeedback', JSON.stringify(result.data));
        
        router.push('/journal/feedback');
      } else {
        setError(`Lỗi phản hồi: ${result.error?.message || 'Lỗi không xác định'}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      setError(`Lỗi: ${errorMessage}`);
    } finally {
      setIsGettingFeedback(false);
    }
  };

  const handleDelete = async () => {
    try {
      await journalService.deleteJournal(journalId);
      setInitialTitle('');
      setInitialContent('');
      router.push('/journal');
    } catch (error) {
      setError('Không thể xóa nhật ký');
    }
  };

  // Handle navigation with unsaved changes check
  const handleNavigation = (path: string) => {
    if (hasUnsavedChanges()) {
      setPendingNavigation(path);
      setShowExitDialog(true);
    } else {
      router.push(path);
    }
  };

  const confirmExit = () => {
    if (pendingNavigation) {
      router.push(pendingNavigation);
    }
    setShowExitDialog(false);
    setPendingNavigation(null);
  };

  const cancelExit = () => {
    setShowExitDialog(false);
    setPendingNavigation(null);
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

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-gray-600">Đang tải nhật ký...</div>
      </div>
    );
  }

  return (
    <>
      <JournalEditorLayout
        title={title}
        content={content}
        journalDate={journalDate}
        tags={tags}
        journalId={journalId}
        isSaving={isSaving}
        isGettingFeedback={isGettingFeedback}
        error={error}
        onTitleChange={setTitle}
        onContentChange={setContent}
        onDateChange={setJournalDate}
        onTagsChange={setTags}
        onSave={handleSave}
        onGetFeedback={handleGetFeedback}
        onDelete={handleDelete}
        onNavigate={handleNavigation}
      />

      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có thay đổi chưa lưu</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn rời khỏi trang này không? Tất cả những thay đổi chưa lưu sẽ bị mất.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelExit}>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmExit}>
              Rời khỏi trang
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
