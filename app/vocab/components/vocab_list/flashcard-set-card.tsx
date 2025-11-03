'use client';

import React from 'react';
import { FlashcardSetStats } from '@/types/flashcardSetStats';

interface FlashcardSetCardProps {
  flashcardSet: FlashcardSetStats;
  onClick?: () => void;
}

export const FlashcardSetCard: React.FC<FlashcardSetCardProps> = ({
  flashcardSet,
  onClick
}) => {
  const duePercentage =
    flashcardSet.total_flashcards > 0
      ? Math.round((flashcardSet.flashcards_due / flashcardSet.total_flashcards) * 100)
      : 0;

  return (
    <div
      className="bg-white rounded-lg shadow-sm p-4 flex flex-col hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
      role="button"
      aria-label={`Open ${flashcardSet.title} flashcard set`}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-gray-900">{flashcardSet.title}</h3>
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
            <rect x="2" y="5" width="16" height="14" rx="2" />
            <line x1="6" y1="9" x2="14" y2="9" />
            <line x1="6" y1="13" x2="12" y2="13" />
            <path d="M22 9V6a2 2 0 0 0-2-2H8" />
            <path d="M22 13v3a2 2 0 0 1-2 2H8" />
          </svg>
          Flashcard Set
        </span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
        <div
          className={`h-1.5 rounded-full ${
            duePercentage > 50
              ? 'bg-amber-500'
              : duePercentage > 0
              ? 'bg-blue-500'
              : 'bg-emerald-500'
          }`}
          style={{ width: `${Math.max(duePercentage, 3)}%` }}
        ></div>
      </div>

      <div className="mt-auto flex justify-between items-center">
        <div className="flex items-center gap-1 text-sm">
          <span className="text-blue-500 font-medium">{flashcardSet.flashcards_due}</span>
          <span className="text-gray-400">/</span>
          <span className="text-gray-500">{flashcardSet.total_flashcards}</span>
          <span className="text-gray-400 text-xs ml-1">cards due</span>
        </div>

        {flashcardSet.flashcards_due > 0 && (
          <button
            className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              console.log(`Review ${flashcardSet.title} flashcards`);
            }}
          >
            Review
          </button>
        )}
      </div>
    </div>
  );
};
