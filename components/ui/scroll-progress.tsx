'use client';

import { useEffect, useState } from 'react';

/**
 * Vertical scroll progress indicator
 * Shows a fixed bar on the right side of the page indicating scroll progress
 */
export function ScrollProgress() {
    const [scrollProgress, setScrollProgress] = useState(0);

    useEffect(() => {
        const updateScrollProgress = () => {
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            const scrollTop = window.scrollY;

            // Calculate scroll percentage
            const totalScrollableHeight = documentHeight - windowHeight;
            const progress = totalScrollableHeight > 0
                ? (scrollTop / totalScrollableHeight) * 100
                : 0;

            setScrollProgress(Math.min(progress, 100));
        };

        // Update on mount
        updateScrollProgress();

        // Update on scroll
        window.addEventListener('scroll', updateScrollProgress);
        window.addEventListener('resize', updateScrollProgress);

        return () => {
            window.removeEventListener('scroll', updateScrollProgress);
            window.removeEventListener('resize', updateScrollProgress);
        };
    }, []);

    return (
        <div
            className="fixed right-0 top-0 h-full w-1 bg-gray-200 z-50"
            style={{ pointerEvents: 'none' }}
        >
            <div
                className="bg-blue-600 w-full transition-all duration-150 ease-out"
                style={{
                    height: `${scrollProgress}%`,
                    boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)'
                }}
            />
        </div>
    );
}
