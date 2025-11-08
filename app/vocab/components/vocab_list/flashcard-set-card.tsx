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
      </div>
    </div>
  );
};
