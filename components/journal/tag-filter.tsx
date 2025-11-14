'use client';

import { useEffect, useState } from 'react';
import { journalService } from '@/services/journal-service';

interface TagFilterProps {
  onFilterChange: (tag: string | null) => void;
  currentTag: string | null;
}

export function TagFilter({ onFilterChange, currentTag }: TagFilterProps) {
  const [selectedTag, setSelectedTag] = useState<string | null>(currentTag);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Fetch tags from database
  useEffect(() => {
    async function fetchTags() {
      setLoading(true);
      try {
        const tags = await journalService.getJournalTags();
        setAvailableTags(tags);
      } catch (error) {
        console.error('Error fetching journal tags:', error);
        setAvailableTags([]);
      } finally {
        setLoading(false);
      }
    }
    
    fetchTags();
  }, []);
  
  // Handle tag change
  const handleTagChange = (tag: string | null) => {
    setSelectedTag(tag);
    onFilterChange(tag);
  };
  
  // Reset filter when currentTag changes from outside
  useEffect(() => {
    setSelectedTag(currentTag);
  }, [currentTag]);
  
  if (loading || availableTags.length === 0) {
    return loading ? (
      <div className="mb-6 bg-white rounded-lg p-4 shadow-sm">
        <h3 className="text-md font-medium text-gray-700 mb-3">Filter by Tag</h3>
        <div className="flex flex-wrap gap-2">
          {Array(3).fill(0).map((_, i) => (
            <div 
              key={`loading-${i}`} 
              className="w-16 h-8 bg-gray-200 animate-pulse rounded-full"
            />
          ))}
        </div>
      </div>
    ) : null;
  }
  
  return (
    <div className="mb-6 bg-white rounded-lg p-4 shadow-sm">
      <h3 className="text-md font-medium text-gray-700 mb-3">Filter by Tag</h3>
      
      <div className="flex flex-wrap gap-2">
        {/* Button "All" to clear filter */}
        <button
          onClick={() => handleTagChange(null)}
          className={`
            px-3 py-1.5 text-sm rounded-full transition-colors
            ${selectedTag === null
              ? 'bg-blue-100 text-blue-800 font-medium'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }
          `}
        >
          All
        </button>
        
        {/* Display available tags */}
        {availableTags.map(tag => (
          <button
            key={tag}
            onClick={() => handleTagChange(tag)}
            className={`
              px-3 py-1.5 text-sm rounded-full transition-colors capitalize
              ${selectedTag === tag
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