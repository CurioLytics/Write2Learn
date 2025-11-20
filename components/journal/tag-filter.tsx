'use client';

import { useEffect, useState } from 'react';
import { journalService } from '@/services/journal-service';

interface TagFilterProps {
  onFilterChange: (tag: string | null) => void;
  currentTag: string | null;
}

export function TagFilter({ onFilterChange, currentTag }: TagFilterProps) {
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  
  useEffect(() => {
    async function fetchTags() {
      try {
        const tags = await journalService.getJournalTags();
        setAvailableTags(tags);
      } catch (error) {
        console.error('Error fetching journal tags:', error);
      }
    }
    
    fetchTags();
  }, []);
  
  if (availableTags.length === 0) return null;
  
  return (
    <div className="mb-6 bg-white rounded-2xl p-4 shadow">
      <h3 className="text-md font-medium text-gray-700 mb-3">Filter by Tag</h3>
      
      <div className="flex flex-wrap gap-2">
        {availableTags.map(tag => (
          <button
            key={tag}
            onClick={() => onFilterChange(currentTag === tag ? null : tag)}
            className={`
              px-3 py-1.5 text-sm rounded-full transition-colors capitalize
              ${currentTag === tag
                ? 'bg-blue-100 text-blue-800 font-medium'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}