import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/auth/use-auth';
import { journalService } from '@/services/journal-service';
import { journalFeedbackService } from '@/services/journal-feedback-service';
import { feedbackLogsService } from '@/services/supabase/feedback-logs-service';
import { formatDateInput } from '@/utils/date-utils';
import { useJournalForm } from './use-journal-form';
import { useUnsavedChanges } from './use-unsaved-changes';

export interface UseJournalEditorOptions {
    mode: 'create' | 'edit';
    journalId?: string;
    templateName?: string | null;
    customContent?: string | null;
    prefilledTag?: string | null;
    entryDate?: string | null;
}

export interface UseJournalEditorReturn {
    // Form state
    title: string;
    content: string;
    journalDate: string;
    tags: string[];
    setTitle: (title: string) => void;
    setContent: (content: string) => void;
    setJournalDate: (date: string) => void;
    setTags: (tags: string[]) => void;

    // UI state
    isSaving: boolean;
    isGettingFeedback: boolean;
    isLoadingData: boolean;
    error: string | null;
    hasContent: boolean;
    journalIdState: string | null;

    // Unsaved changes
    hasUnsavedChanges: boolean;
    showExitDialog: boolean;

    // Actions
    handleSave: () => Promise<void>;
    handleGetFeedback: () => Promise<void>;
    handleDelete: () => Promise<void>;
    handleNavigation: (path: string) => void;
    confirmExit: () => void;
    cancelExit: () => void;
}

/**
 * Main hook for journal editor functionality
 * Handles both create and edit modes
 */
export function useJournalEditor(options: UseJournalEditorOptions): UseJournalEditorReturn {
    const { mode, journalId, templateName, customContent, prefilledTag, entryDate } = options;
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();

    const [journalIdState, setJournalIdState] = useState<string | null>(journalId || null);
    const [isSaving, setIsSaving] = useState(false);
    const [isGettingFeedback, setIsGettingFeedback] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(mode === 'edit');
    const [error, setError] = useState<string | null>(null);
    const hasLoadedData = useRef(false);

    // Initialize form with proper date format
    const initialDate = entryDate || formatDateInput(new Date());
    const form = useJournalForm({
        initialDate,
    });

    const unsavedChanges = useUnsavedChanges({
        initialTitle: '',
        initialContent: '',
        currentTitle: form.title,
        currentContent: form.content,
    });

    // Redirect to auth if not logged in
    useEffect(() => {
        if (!authLoading && !user && !sessionStorage.getItem('onboardingData')) {
            router.push('/auth');
        }
    }, [user, authLoading, router]);

    // Handle initialization for create mode
    useEffect(() => {
        if (mode === 'create') {
            if (customContent) {
                const decodedContent = decodeURIComponent(customContent);
                form.setContent(decodedContent);
                if (templateName) {
                    form.setTitle(templateName);
                }
            } else if (templateName) {
                form.setTitle(templateName);
            }

            // Pre-fill tag if coming from tag filter
            if (prefilledTag && !form.tags.includes(prefilledTag)) {
                form.setTags([...form.tags, prefilledTag]);
            }
        }
    }, [mode, templateName, customContent, prefilledTag]);

    // Load journal data for edit mode
    useEffect(() => {
        if (mode === 'edit' && journalId && user && !hasLoadedData.current) {
            const fetchJournal = async () => {
                try {
                    const journalData = await journalService.getJournalById(journalId);
                    const journalTags = await journalService.getJournalEntryTags(journalId);

                    const loadedTitle = journalData.title || '';
                    const loadedContent = journalData.content || '';

                    form.setTitle(loadedTitle);
                    form.setContent(loadedContent);
                    form.setJournalDate(journalData.journal_date || formatDateInput(new Date()));
                    form.setTags(journalTags);

                    // Mark as saved state for unsaved changes detection
                    unsavedChanges.markAsSaved(loadedTitle, loadedContent);

                    hasLoadedData.current = true;
                } catch (err) {
                    console.error('Error fetching journal:', err);
                    setError('Không thể tải nhật ký. Vui lòng thử lại.');
                } finally {
                    setIsLoadingData(false);
                }
            };

            fetchJournal();
        }
    }, [mode, journalId, user]);

    const handleSave = async () => {
        setError(null);
        setIsSaving(true);

        try {
            if (user) {
                if (journalIdState) {
                    // Update existing journal
                    await journalService.updateJournal(journalIdState, {
                        title: form.title,
                        content: form.content,
                        journal_date: form.journalDate,
                    });
                    if (form.tags.length > 0) {
                        await journalService.saveJournalTags(journalIdState, form.tags);
                    }
                } else {
                    // Create new journal
                    const result = await journalService.createJournal(user.id, {
                        title: form.title,
                        content: form.content,
                        journal_date: form.journalDate,
                    });
                    if (form.tags.length > 0) {
                        await journalService.saveJournalTags(result.id, form.tags);
                    }
                    setJournalIdState(result.id);
                }

                // Mark as saved
                unsavedChanges.markAsSaved(form.title, form.content);
                router.push('/journal');
            } else {
                // Offline mode
                const offlineEntry = {
                    id: `offline-${Date.now()}`,
                    title: form.title,
                    content: form.content,
                    entryDate: form.journalDate,
                    createdAt: new Date().toISOString(),
                };
                const saved = JSON.parse(localStorage.getItem('offlineJournalEntries') || '[]');
                saved.push(offlineEntry);
                localStorage.setItem('offlineJournalEntries', JSON.stringify(saved));
                router.push('/auth?message=journal_saved');
            }
        } catch (err) {
            setError('Không thể lưu nhật ký');
        } finally {
            setIsSaving(false);
        }
    };

    const handleGetFeedback = async () => {
        if (!form.content.trim()) {
            setError('Vui lòng viết nội dung trước');
            return;
        }
        if (!user?.id) {
            setError('Vui lòng đăng nhập');
            return;
        }

        setIsGettingFeedback(true);
        setError(null);

        try {
            console.log('📤 Requesting feedback for:', { title: form.title, contentLength: form.content.length });

            // For edit mode, persist latest edits before generating feedback
            if (mode === 'edit' && journalIdState) {
                try {
                    await journalService.updateJournal(journalIdState, {
                        title: form.title || null,
                        content: form.content,
                        journal_date: form.journalDate,
                        is_draft: true,
                    });
                } catch (e) {
                    console.error('Failed to update journal before feedback:', e);
                }
            }

            const result = await journalFeedbackService.getFeedback(form.content, form.title);
            console.log('📥 Feedback result:', result);

            if (result.success && result.data) {
                // Step 1: Create/update draft journal in database
                let draftJournalId = journalIdState;

                if (!draftJournalId) {
                    // Create new draft journal
                    const draftResult = await journalService.createDraftJournal(user.id, {
                        title: form.title || null,
                        content: form.content,
                        journal_date: form.journalDate,
                        summary: result.data.summary,
                    });
                    draftJournalId = draftResult.id;
                    setJournalIdState(draftResult.id);
                } else {
                    // Update existing journal as draft with summary
                    await journalService.updateJournal(draftJournalId, {
                        title: form.title || null,
                        content: form.content,
                        journal_date: form.journalDate,
                        summary: result.data.summary,
                        is_draft: true,
                    });
                }

                // Step 2: Save feedback to feedbacks table (without summary)
                const feedbackId = await feedbackLogsService.saveFeedback({
                    userId: user.id,
                    sourceId: draftJournalId,
                    sourceType: 'journal',
                    feedbackData: {
                        clarity: result.data.output?.clarity,
                        vocabulary: result.data.output?.vocabulary,
                        ideas: result.data.output?.ideas,
                        enhanced_version: result.data.enhanced_version || result.data.improvedVersion,
                    },
                    grammarDetails: result.data.grammar_details || [],
                });

                console.log('✅ Saved draft and feedback to DB:', { draftJournalId, feedbackId });

                // Step 3: Navigate to feedback page with IDs
                router.push(`/journal/feedback?journalId=${draftJournalId}&feedbackId=${feedbackId}`);
            } else {
                console.error('❌ Feedback failed:', result.error);
                setError(`Lỗi phản hồi: ${result.error?.message || 'Lỗi không xác định'}`);
            }
        } catch (err) {
            console.error('❌ Exception in handleGetFeedback:', err);
            const errorMessage = err instanceof Error ? err.message : 'Lỗi không xác định';
            setError(`Lỗi: ${errorMessage}`);
        } finally {
            setIsGettingFeedback(false);
        }
    };

    const handleDelete = async () => {
        if (!journalIdState) return;

        try {
            await journalService.deleteJournal(journalIdState);
            unsavedChanges.markAsSaved('', '');
            router.push('/journal');
        } catch (err) {
            setError('Không thể xóa nhật ký');
        }
    };

    return {
        // Form state
        title: form.title,
        content: form.content,
        journalDate: form.journalDate,
        tags: form.tags,
        setTitle: form.setTitle,
        setContent: form.setContent,
        setJournalDate: form.setJournalDate,
        setTags: form.setTags,

        // UI state
        isSaving,
        isGettingFeedback,
        isLoadingData,
        error,
        hasContent: form.hasContent,
        journalIdState,

        // Unsaved changes
        hasUnsavedChanges: unsavedChanges.hasUnsavedChanges,
        showExitDialog: unsavedChanges.showExitDialog,

        // Actions
        handleSave,
        handleGetFeedback,
        handleDelete,
        handleNavigation: (path: string) => unsavedChanges.handleNavigation(path, router),
        confirmExit: () => unsavedChanges.confirmExit(router),
        cancelExit: unsavedChanges.cancelExit,
    };
}
