'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';

interface RoleplayCardProps {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
}

export function RoleplayCard({ id, title, description, imageUrl }: RoleplayCardProps) {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  
  const handleClick = () => {
    if (!isDragging) {
      router.push(`/roleplay/${id}`);
    }
  };

  return (
    <div 
      className="w-64 border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer select-none"
      onClick={handleClick}
      onMouseDown={() => setIsDragging(false)}
      onMouseMove={() => setIsDragging(true)}
    >
      <div className="h-32 bg-gray-300 relative">
        {imageUrl ? (
          <Image 
            src={imageUrl} 
            alt={title} 
            fill 
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">
            <span>🎭</span>
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-medium text-gray-800 text-sm truncate">{title}</h3>
        <p className="text-xs text-gray-600 mt-1 line-clamp-2">{description}</p>
        <button className="mt-2 text-xs flex items-center text-blue-600 hover:text-blue-800">
          <span>Start</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}