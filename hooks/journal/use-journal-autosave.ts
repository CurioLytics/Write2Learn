import { useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface JournalDraft {
  title: string;
  content: string;
  journalDate: string;
  tags: string[];
}

interface UseJournalAutosaveProps {
  title: string;
  content: string;
  journalDate: string;
  tags: string[];
  journalId?: string | null;
  onSave?: () => Promise<void>;
  draftKey?: string;
}

export function useJournalAutosave({
  title,
  content,
  journalDate,
  tags,
  journalId,
  onSave,
  draftKey = 'journalDraft'
}: UseJournalAutosaveProps) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const savePromiseRef = useRef<Promise<void> | null>(null);

  const saveDraft = useCallback(() => {
    const draft: JournalDraft = { title, content, journalDate, tags };
    localStorage.setItem(draftKey, JSON.stringify(draft));
  }, [title, content, journalDate, tags, draftKey]);

  const loadDraft = useCallback((): JournalDraft | null => {
    try {
      const draft = localStorage.getItem(draftKey);
      return draft ? JSON.parse(draft) : null;
    } catch {
      return null;
    }
  }, [draftKey]);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(draftKey);
  }, [draftKey]);

  // Debounced local storage save (500ms delay)
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(saveDraft, 500);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [saveDraft]);

  // Save to DB on unmount (navigation away) and page unload (reload/close)
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveDraft();
      if (onSave && (title || content)) {
        savePromiseRef.current = onSave();
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      saveDraft();
      
      // Save to DB on navigation away
      if (onSave && (title || content)) {
        onSave().catch(err => console.error('Auto-save failed:', err));
      }
    };
  }, [saveDraft, onSave, title, content]);

  return { loadDraft, clearDraft, saveDraft };
}