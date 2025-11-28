import { useState, useCallback } from 'react';

export interface JournalFormState {
    title: string;
    content: string;
    journalDate: string;
    tags: string[];
}

export interface UseJournalFormOptions {
    initialTitle?: string;
    initialContent?: string;
    initialDate?: string;
    initialTags?: string[];
}

export interface UseJournalFormReturn extends JournalFormState {
    setTitle: (title: string) => void;
    setContent: (content: string) => void;
    setJournalDate: (date: string) => void;
    setTags: (tags: string[]) => void;
    resetForm: () => void;
    hasContent: boolean;
}

/**
 * Custom hook to manage journal form state
 * Handles title, content, date, and tags
 */
export function useJournalForm(options: UseJournalFormOptions = {}): UseJournalFormReturn {
    const {
        initialTitle = '',
        initialContent = '',
        initialDate = new Date().toISOString().split('T')[0],
        initialTags = [],
    } = options;

    const [title, setTitle] = useState(initialTitle);
    const [content, setContent] = useState(initialContent);
    const [journalDate, setJournalDate] = useState(initialDate);
    const [tags, setTags] = useState<string[]>(initialTags);

    const resetForm = useCallback(() => {
        setTitle(initialTitle);
        setContent(initialContent);
        setJournalDate(initialDate);
        setTags(initialTags);
    }, [initialTitle, initialContent, initialDate, initialTags]);

    const hasContent = Boolean(title.trim() || content.trim());

    return {
        title,
        content,
        journalDate,
        tags,
        setTitle,
        setContent,
        setJournalDate,
        setTags,
        resetForm,
        hasContent,
    };
}
