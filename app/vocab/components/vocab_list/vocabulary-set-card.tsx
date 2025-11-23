'use client';

import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { FlashcardSetStats } from '@/types/flashcardSetStats';
import { toast } from 'sonner';
import { toggleVocabularySetStar } from '@/utils/star-helpers';
import { useAuth } from '@/hooks/auth/use-auth';

interface VocabularySetCardProps {
  vocabularySet: FlashcardSetStats & { is_starred?: boolean };
  onClick?: () => void;
  onStarToggle?: (setId: string, isStarred: boolean) => void;
}

// Legacy alias for backward compatibility
export interface FlashcardSetCardProps extends VocabularySetCardProps {
  flashcardSet: FlashcardSetStats;
}

export const VocabularySetCard: React.FC<VocabularySetCardProps> = ({
  vocabularySet,
  onClick,
  onStarToggle
}) => {
  const { user } = useAuth();
  const [isStarred, setIsStarred] = useState(vocabularySet.is_starred || false);
  const [isStarLoading, setIsStarLoading] = useState(false);

  const handleStarToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isStarLoading || !user) return;
    
    setIsStarLoading(true);
    
    try {
      const newStarredStatus = await toggleVocabularySetStar(vocabularySet.set_id);
      
      setIsStarred(newStarredStatus);
      onStarToggle?.(vocabularySet.set_id, newStarredStatus);
      
      toast.success(
        newStarredStatus ? 'Added to favorites' : 'Removed from favorites'
      );
    } catch (error: any) {
      console.error('Error toggling star:', error);
      toast.error(error.message || 'Failed to update favorites');
    } finally {
      setIsStarLoading(false);
    }
  };
  const duePercentage =
    vocabularySet.total_flashcards > 0
      ? Math.round((vocabularySet.flashcards_due / vocabularySet.total_flashcards) * 100)
      : 0;

  // Invert the progress: higher due percentage = less full progress bar
  const progressPercentage = 100 - duePercentage;

  return (
    <div
      className="bg-white rounded-lg shadow-sm p-4 flex flex-col hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
      role="button"
      aria-label={`Open ${vocabularySet.title}`}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-gray-900 flex-1 pr-2">{vocabularySet.title}</h3>
        <button
          onClick={handleStarToggle}
          className={`p-1 rounded-full transition-colors ${
            vocabularySet.is_starred
              ? 'text-yellow-500 hover:text-yellow-600' 
              : 'text-gray-400 hover:text-yellow-500'
          }`}
          aria-label={vocabularySet.is_starred ? 'Unstar' : 'Star'}
        >
          <Star 
            size={16} 
            className={vocabularySet.is_starred ? 'fill-current' : ''}
          />
        </button>
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
        <span className="flex items-center gap-1">
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
          <span className="text-[var(--primary)] font-medium">{vocabularySet.flashcards_due}</span>
          <span className="text-gray-400">/</span>
          <span className="text-gray-500">{vocabularySet.total_flashcards}</span>
        </div>

        {vocabularySet.flashcards_due > 0 && (
          <button
            className="text-xs px-2 py-1 bg-[var(--primary-blue-light)] text-[var(--primary)] rounded hover:bg-[var(--primary-blue-lighter)] transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              console.log(`Review ${vocabularySet.title} vocabulary`);
            }}
            aria-label="Review vocabulary set"
          >
          </button>
        )}
      </div>
    </div>
  );
};
