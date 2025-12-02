'use client';

import * as React from 'react';
import { cn } from '@/utils/ui';

interface HorizontalScrollListProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export function HorizontalScrollList({ children, className, ...props }: HorizontalScrollListProps) {
    return (
        <div
            className={cn(
                "flex overflow-x-auto gap-6 pb-2 cursor-grab w-full",
                className
            )}
            style={{
                WebkitOverflowScrolling: 'touch'
            }}
            onMouseDown={(e) => {
                const slider = e.currentTarget;
                let isDown = true;
                let startX = e.pageX - slider.offsetLeft;
                let scrollLeft = slider.scrollLeft;

                slider.style.cursor = 'grabbing';

                const handleMouseMove = (e: MouseEvent) => {
                    if (!isDown) return;
                    e.preventDefault();
                    const x = e.pageX - slider.offsetLeft;
                    const walk = (x - startX) * 2;
                    slider.scrollLeft = scrollLeft - walk;
                };

                const handleMouseUp = () => {
                    isDown = false;
                    slider.style.cursor = 'grab';
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                };

                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
            }}
            {...props}
        >
            {children}
        </div>
    );
}
