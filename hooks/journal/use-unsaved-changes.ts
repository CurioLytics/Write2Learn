import { useState, useEffect, useCallback } from 'react';

export interface UseUnsavedChangesOptions {
    initialTitle: string;
    initialContent: string;
    currentTitle: string;
    currentContent: string;
}

export interface UseUnsavedChangesReturn {
    hasUnsavedChanges: boolean;
    showExitDialog: boolean;
    pendingNavigation: string | null;
    setShowExitDialog: (show: boolean) => void;
    setPendingNavigation: (path: string | null) => void;
    handleNavigation: (path: string, router: any) => void;
    confirmExit: (router: any) => void;
    cancelExit: () => void;
    markAsSaved: (title: string, content: string) => void;
}

/**
 * Custom hook to detect unsaved changes and handle navigation warnings
 */
export function useUnsavedChanges(options: UseUnsavedChangesOptions): UseUnsavedChangesReturn {
    const { initialTitle, initialContent, currentTitle, currentContent } = options;

    const [showExitDialog, setShowExitDialog] = useState(false);
    const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
    const [savedTitle, setSavedTitle] = useState(initialTitle);
    const [savedContent, setSavedContent] = useState(initialContent);

    // Check if there are unsaved changes
    const hasUnsavedChanges = useCallback(() => {
        return (
            (currentTitle !== savedTitle || currentContent !== savedContent) &&
            (currentTitle || currentContent)
        );
    }, [currentTitle, currentContent, savedTitle, savedContent]);

    // Warn on unsaved changes when trying to leave page
    // This handles: refresh, close tab, browser back/forward
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            // Check unsaved changes directly
            const hasChanges = (
                (currentTitle !== savedTitle || currentContent !== savedContent) &&
                (currentTitle || currentContent)
            );

            console.log('🔔 beforeunload triggered', {
                hasChanges,
                currentTitle,
                savedTitle,
                currentContent: currentContent.substring(0, 50),
                savedContent: savedContent.substring(0, 50)
            });

            if (hasChanges) {
                console.log('⚠️ Preventing navigation - unsaved changes detected');
                e.preventDefault();
                e.returnValue = '';
                return '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [currentTitle, currentContent, savedTitle, savedContent]);

    // Handle navigation with unsaved changes check
    const handleNavigation = useCallback((path: string, router: any) => {
        if (hasUnsavedChanges()) {
            setPendingNavigation(path);
            setShowExitDialog(true);
        } else {
            router.push(path);
        }
    }, [hasUnsavedChanges]);

    const confirmExit = useCallback((router: any) => {
        if (pendingNavigation) {
            router.push(pendingNavigation);
        }
        setShowExitDialog(false);
        setPendingNavigation(null);
    }, [pendingNavigation]);

    const cancelExit = useCallback(() => {
        setShowExitDialog(false);
        setPendingNavigation(null);
    }, []);

    const markAsSaved = useCallback((title: string, content: string) => {
        setSavedTitle(title);
        setSavedContent(content);
    }, []);

    return {
        hasUnsavedChanges: hasUnsavedChanges(),
        showExitDialog,
        pendingNavigation,
        setShowExitDialog,
        setPendingNavigation,
        handleNavigation,
        confirmExit,
        cancelExit,
        markAsSaved,
    };
}
