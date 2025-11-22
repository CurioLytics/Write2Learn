import { useEffect, useCallback, useRef } from 'react';

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
  const isSavingRef = useRef(false);
  const hasUnsavedChangesRef = useRef(false);

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

  const saveToDatabase = useCallback(async () => {
    if (!onSave || isSavingRef.current || (!title && !content)) {
      return;
    }

    try {
      isSavingRef.current = true;
      await onSave();
      hasUnsavedChangesRef.current = false;
    } catch (err) {
      console.error('Auto-save to database failed:', err);
    } finally {
      isSavingRef.current = false;
    }
  }, [onSave, title, content]);

  // Track changes
  useEffect(() => {
    if (title || content) {
      hasUnsavedChangesRef.current = true;
    }
  }, [title, content]);

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

  // Save to DB ONLY on unmount (one time)
  useEffect(() => {
    return () => {
      // Save draft to localStorage immediately
      saveDraft();
      
      // Save to database if there are unsaved changes
      if (hasUnsavedChangesRef.current && !isSavingRef.current) {
        saveToDatabase();
      }
    };
  }, [saveDraft, saveToDatabase]);

  return { loadDraft, clearDraft, saveDraft };
}