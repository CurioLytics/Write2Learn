'use client';

import React, { useEffect, useState } from 'react';

interface PageContentWrapperProps {
    isLoading: boolean;
    skeleton: React.ReactNode;
    children: React.ReactNode;
    fadeInDuration?: number;
}

export function PageContentWrapper({
    isLoading,
    skeleton,
    children,
    fadeInDuration = 500
}: PageContentWrapperProps) {
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        if (!isLoading) {
            // Small delay to ensure smooth transition
            const timer = setTimeout(() => {
                setShouldRender(true);
            }, 50);
            return () => clearTimeout(timer);
        } else {
            setShouldRender(false);
        }
    }, [isLoading]);

    if (isLoading) {
        return <>{skeleton}</>;
    }

    return (
        <div
            className={`transition-opacity duration-${fadeInDuration} ${shouldRender ? 'opacity-100' : 'opacity-0'
                }`}
            style={{
                animation: shouldRender ? `fadeIn ${fadeInDuration}ms ease-in` : 'none'
            }}
        >
            {children}
        </div>
    );
}
