'use client';
import { useRouter } from 'next/navigation';

import React from 'react';
import { FlashcardSetStats } from '@/types/flashcardSetStats';
import { VocabularySetCard } from './vocabulary-set-card';

interface VocabularySetListProps {
  vocabularySets: FlashcardSetStats[];
  isLoading?: boolean;
  error?: string | null;
  onSelectSet?: (setId: string) => void;
  onStarToggle?: (setId: string, newStarredStatus: boolean) => void;
  onDelete?: (setId: string) => void;
}

// Legacy alias for backward compatibility
export interface FlashcardSetListProps extends VocabularySetListProps {
  flashcardSets: FlashcardSetStats[];
}

export const VocabularySetList: React.FC<VocabularySetListProps> = ({
  vocabularySets,
  isLoading = false,
  error = null,
  onSelectSet,
  onStarToggle,
  onDelete
}) => {
  const router = useRouter();

  if (isLoading) {
    return (
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={`skeleton-${index}`}
              className="bg-white rounded-lg shadow-sm p-4 animate-pulse"
            >
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mb-4"></div>
              <div className="flex justify-between items-center">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-6 bg-gray-200 rounded w-1/5"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="bg-red-50 text-red-700 p-3 rounded-md">
          Error loading vocabulary sets: {error}
        </div>
      </div>
    );
  }

  if (vocabularySets.length === 0) {
    return (
      <div>
        <div className="bg-gray-50 border border-gray-200 border-dashed rounded-md p-6 text-center">
          <h3 className="text-base font-medium text-gray-700 mb-1">Chưa có bộ nào ~~</h3>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {vocabularySets.map((set) => (
          <VocabularySetCard
            key={set.set_id}
            vocabularySet={set}
            onClick={() => {
              if (onSelectSet) {
                onSelectSet(set.set_id);
              } else {
                router.push(`/vocab/${set.set_id}`);
              }
            }}
            onStarToggle={onStarToggle}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
};

// Legacy alias for backward compatibility
export const FlashcardSetList: React.FC<FlashcardSetListProps> = ({
  flashcardSets,
  isLoading,
  error,
  onSelectSet
}) => {
  return <VocabularySetList
    vocabularySets={flashcardSets}
    isLoading={isLoading}
    error={error}
    onSelectSet={onSelectSet}
  />;
};
