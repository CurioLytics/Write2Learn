'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useJournalEditor } from '@/hooks/journal/use-journal-editor';
import { Button } from '@/components/ui/button';
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

export default function JournalEditPage() {
  const params = useParams();
  const journalId = params?.id as string;

  const editor = useJournalEditor({
    mode: 'edit',
    journalId,
  });

  if (editor.error && !editor.content) {
    return (
      <div className="flex flex-col items-center justify-center bg-white px-6 py-20">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Không thể tải nhật ký</h1>
          <p className="text-gray-600 mb-6">{editor.error}</p>
          <Link href="/journal">
            <Button>Quay lại danh sách</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (editor.isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-gray-600">Đang tải nhật ký...</div>
      </div>
    );
  }

  return (
    <>
      <JournalEditorLayout
        title={editor.title}
        content={editor.content}
        journalDate={editor.journalDate}
        tags={editor.tags}
        journalId={journalId}
        isSaving={editor.isSaving}
        isGettingFeedback={editor.isGettingFeedback}
        error={editor.error}
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
