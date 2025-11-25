'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/auth/use-auth';
import { journalFeedbackService } from '@/services/journal-feedback-service';
import { journalService } from '@/services/journal-service';
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

export default function NewJournalPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isGettingFeedback, setIsGettingFeedback] = useState(false);
  const [journalDate, setJournalDate] = useState(formatDateInput(new Date()));
  const [tags, setTags] = useState<string[]>([]);
  const [journalId, setJournalId] = useState<string | null>(null);
  const [initialTitle, setInitialTitle] = useState('');
  const [initialContent, setInitialContent] = useState('');
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  const templateName = searchParams?.get('templateName');
  const customContent = searchParams?.get('customContent');
  const prefilledTag = searchParams?.get('tag');

  // Check if there are unsaved changes
  const hasUnsavedChanges = useCallback(() => {
    return (title !== initialTitle || content !== initialContent) && (title || content);
  }, [title, content, initialTitle, initialContent]);

  // Check if any edits have been made (for enabling/disabling buttons)
  const hasAnyContent = Boolean(title.trim() || content.trim());

  useEffect(() => {
    if (!loading && !user && !sessionStorage.getItem('onboardingData')) {
      router.push('/auth');
    }
  }, [user, loading, router]);

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
    // Check if we're loading a draft from feedback page
    const draftJson = sessionStorage.getItem('journalDraft');
    if (draftJson) {
      try {
        const draft = JSON.parse(draftJson);
        console.log('Loading journal draft:', draft);
        
        setTitle(draft.title || '');
        setContent(draft.content || '');
        setInitialTitle(draft.title || '');
        setInitialContent(draft.content || '');
        setJournalDate(draft.journalDate || formatDateInput(new Date()));
        setTags(draft.tags || []);
        if (draft.journalId) {
          setJournalId(draft.journalId);
        }
        
        // Clear the draft after loading
        sessionStorage.removeItem('journalDraft');
        return;
      } catch (e) {
        console.error('Failed to parse journal draft:', e);
      }
    }

    // Handle other initialization scenarios
    if (customContent) {
      const decodedContent = decodeURIComponent(customContent);
      setContent(decodedContent);
      setInitialContent(decodedContent);
      if (templateName) {
        setTitle(templateName);
        setInitialTitle(templateName);
      }
      return;
    }

    if (templateName) {
      setTitle(templateName);
      setInitialTitle(templateName);
      return;
    }
    
    // Pre-fill tag if coming from tag filter
    if (prefilledTag && !tags.includes(prefilledTag)) {
      setTags(prev => [...prev, prefilledTag]);
    }
  }, [templateName, customContent, prefilledTag]);

  const handleSave = async () => {
    setError(null);
    setIsSaving(true);

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
        // Mark as saved by updating initial values
        setInitialTitle(title);
        setInitialContent(content);
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
          journalId: journalId || null,
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
    if (!journalId) return;
    
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

  return (
    <>
      <JournalEditorLayout
        title={title}
        content={content}
        journalDate={journalDate}
        tags={tags}
        journalId={journalId || undefined}
        isSaving={isSaving}
        isGettingFeedback={isGettingFeedback}
        error={error}
        hasContent={hasAnyContent}
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
