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
      className="w-48 sm:w-52 lg:w-56 border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer select-none bg-white flex-shrink-0"
      onClick={handleClick}
      onMouseDown={() => setIsDragging(false)}
      onMouseMove={() => setIsDragging(true)}
    >
      <div className="h-24 sm:h-28 lg:h-32 bg-gray-100 relative">
        {imageUrl ? (
          <Image 
            src={imageUrl} 
            alt={title} 
            fill 
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xl sm:text-2xl">
            <span>🎭</span>
          </div>
        )}
      </div>
      <div className="p-2 sm:p-3">
        <h3 className="font-medium text-gray-800 text-xs sm:text-sm truncate mb-1">{title}</h3>
        <p className="text-xs text-gray-500 line-clamp-2 mb-2">{description}</p>
        <div className="flex items-center text-[var(--primary)] text-xs">
          <span>Bắt đầu</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
}