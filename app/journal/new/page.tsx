'use client';

import { useSearchParams } from 'next/navigation';
import { useJournalEditor } from '@/hooks/journal/use-journal-editor';
import { JournalEditorLayout } from '@/components/journal/journal-editor-layout';
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
  const searchParams = useSearchParams();

  const templateName = searchParams?.get('templateName');
  const customContent = searchParams?.get('customContent');
  const prefilledTag = searchParams?.get('tag');
  const entryDate = searchParams?.get('date');

  const editor = useJournalEditor({
    mode: 'create',
    templateName,
    customContent,
    prefilledTag,
    entryDate,
  });

  return (
    <>
      <JournalEditorLayout
        title={editor.title}
        content={editor.content}
        journalDate={editor.journalDate}
        tags={editor.tags}
        journalId={editor.journalIdState || undefined}
        isSaving={editor.isSaving}
        isGettingFeedback={editor.isGettingFeedback}
        error={editor.error}
        hasContent={editor.hasContent}
        onTitleChange={editor.setTitle}
        onContentChange={editor.setContent}
        onDateChange={editor.setJournalDate}
        onTagsChange={editor.setTags}
        onSave={editor.handleSave}
        onGetFeedback={editor.handleGetFeedback}
        onDelete={editor.handleDelete}
        onNavigate={editor.handleNavigation}
      />

      <AlertDialog open={editor.showExitDialog} onOpenChange={() => { }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có thay đổi chưa lưu</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn rời khỏi trang này không? Tất cả những thay đổi chưa lưu sẽ bị mất.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={editor.cancelExit}>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={editor.confirmExit}>
              Rời khỏi trang
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
