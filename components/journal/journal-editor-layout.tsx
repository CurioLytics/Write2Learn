'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BreathingLoader } from '@/components/ui/breathing-loader';
import { LiveMarkdownEditor, type LiveMarkdownEditorRef } from '@/components/features/journal/editor';
import { JournalActionsMenu } from '@/components/journal/journal-actions-menu';
import { FloatingVoiceButton } from '@/components/journal/floating-voice-button';

interface JournalEditorLayoutProps {
  title: string;
  content: string;
  journalDate: string;
  tags: string[];
  journalId?: string;
  isLoading: boolean;
  error: string | null;
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
  onDateChange: (date: string) => void;
  onTagsChange: (tags: string[]) => void;
  onSave: () => void;
  onGetFeedback: () => void;
  onDelete: () => void;
  onVoiceTranscript: (text: string, isFinal: boolean) => void;
}

export function JournalEditorLayout({
  title,
  content,
  journalDate,
  tags,
  journalId,
  isLoading,
  error,
  onTitleChange,
  onContentChange,
  onDateChange,
  onTagsChange,
  onSave,
  onGetFeedback,
  onDelete,
  onVoiceTranscript,
}: JournalEditorLayoutProps) {
  const editorRef = useRef<LiveMarkdownEditorRef>(null);

  const handleVoiceTranscript = (text: string, isFinal: boolean) => {
    if (isFinal && editorRef.current) {
      editorRef.current.insertTextAtCursor(text);
    }
    onVoiceTranscript(text, isFinal);
  };

  return (
    <div className="bg-white px-6 py-8">
      <main className="max-w-3xl w-full mx-auto flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <Link href="/journal" className="text-blue-600 text-sm hover:underline">
            ⬅ Back to Journal
          </Link>
          <div className="flex items-center gap-3">
            <JournalActionsMenu
              journalId={journalId}
              currentDate={journalDate}
              currentTags={tags}
              onDateChange={onDateChange}
              onTagsChange={onTagsChange}
              onDelete={onDelete}
            />
            <Button onClick={onSave} variant="outline">
              Lưu
            </Button>
            <Button onClick={onGetFeedback} disabled={!content || !title}>
              Nhận phản hồi
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Tiêu đề..."
            className="text-3xl font-semibold focus:outline-none placeholder-gray-400 bg-transparent w-full"
          />
        </div>

        <LiveMarkdownEditor
          ref={editorRef}
          value={content}
          onChange={onContentChange}
          placeholder="Bắt đầu viết ở đây..."
          minHeight={400}
        />

        {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}

        {isLoading && (
          <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <BreathingLoader 
              message="Getting personalized feedback..."
              className="bg-white rounded-lg shadow-lg p-8"
            />
          </div>
        )}
      </main>
      {!isLoading && <FloatingVoiceButton onTranscript={handleVoiceTranscript} />}
    </div>
  );
}
