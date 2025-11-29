import React from 'react';

interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
    return (
        <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
    );
}

export function PageHeaderSkeleton() {
    return (
        <div className="w-full max-w-3xl bg-white shadow rounded-2xl p-6">
            <Skeleton className="h-9 w-64 mb-2" />
            <Skeleton className="h-5 w-96" />
        </div>
    );
}

export function CardSkeleton() {
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
        </div>
    );
}

export function ListItemSkeleton() {
    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-2">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
        </div>
    );
}

export function GridSkeleton({ count = 6 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: count }).map((_, i) => (
                <CardSkeleton key={i} />
            ))}
        </div>
    );
}

export function HorizontalCardsSkeleton({ count = 3 }: { count?: number }) {
    return (
        <div className="flex overflow-x-auto gap-4 sm:gap-6 pb-2">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="flex-shrink-0 snap-center">
                    <Skeleton className="h-40 w-64 rounded-xl" />
                </div>
            ))}
        </div>
    );
}

export function TemplateCardsSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <CardSkeleton key={i} />
            ))}
        </div>
    );
}

export function JournalListSkeleton() {
    return (
        <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
                <ListItemSkeleton key={i} />
            ))}
        </div>
    );
}

export function VocabSetListSkeleton() {
    return (
        <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
                    <div className="flex items-start justify-between">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-5 w-16" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <div className="flex gap-4">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                </div>
            ))}
        </div>
    );
}
