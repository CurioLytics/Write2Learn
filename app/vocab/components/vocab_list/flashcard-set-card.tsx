'use client';

import React from 'react';
import { VocabularySetStats } from '@/types/vocabulary';

interface VocabularySetCardProps {
  vocabularySet: VocabularySetStats;
  onClick?: () => void;
}

// Legacy alias for backward compatibility
export interface FlashcardSetCardProps extends VocabularySetCardProps {
  flashcardSet: VocabularySetStats;
}

export const VocabularySetCard: React.FC<VocabularySetCardProps> = ({
  vocabularySet,
  onClick
}) => {
  const duePercentage =
    vocabularySet.total_vocabulary > 0
      ? Math.round((vocabularySet.vocabulary_due / vocabularySet.total_vocabulary) * 100)
      : 0;

  // Invert the progress: higher due percentage = less full progress bar
  const progressPercentage = 100 - duePercentage;

  return (
    <div
      className="bg-white rounded-lg shadow-sm p-4 flex flex-col hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
      role="button"
      aria-label={`Open ${vocabularySet.set_title}`}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-gray-900">{vocabularySet.set_title}</h3>
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
        <span className="flex items-center gap-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            <path d="M8 7h8"></path>
            <path d="M8 11h8"></path>
          </svg>
        </span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
        <div
          className={`h-1.5 rounded-full ${
            duePercentage > 50
              ? 'bg-red-500'
              : duePercentage > 0
              ? 'bg-amber-500'
              : 'bg-emerald-500'
          }`}
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>

      <div className="mt-auto flex justify-between items-center">
        <div className="flex items-center gap-1 text-sm">
          <span className="text-blue-500 font-medium">{vocabularySet.vocabulary_due}</span>
          <span className="text-gray-400">/</span>
          <span className="text-gray-500">{vocabularySet.total_vocabulary}</span>
        </div>

        {vocabularySet.vocabulary_due > 0 && (
          <button
            className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              console.log(`Review ${vocabularySet.set_title} vocabulary`);
            }}
            aria-label="Review vocabulary set"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

// Legacy alias for backward compatibility
export const FlashcardSetCard: React.FC<FlashcardSetCardProps> = ({
  flashcardSet,
  onClick
}) => {
  return <VocabularySetCard vocabularySet={flashcardSet} onClick={onClick} />;
};
