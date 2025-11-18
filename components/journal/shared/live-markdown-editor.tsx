'use client';

import { useState, useEffect } from 'react';

interface LiveMarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
  className?: string;
}

/**
 * Shared LiveMarkdownEditor component that handles SSR compatibility
 * and provides a consistent interface for markdown editing across the app
 */
export function LiveMarkdownEditor({
  value,
  onChange,
  placeholder = 'Start writing...',
  minHeight = 300,
  className = '',
}: LiveMarkdownEditorProps) {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={`live-markdown-editor ${className}`}>
      <div className="rounded-md bg-white">
        {!isClient ? (
          <div 
            className="prose prose-sm sm:prose-base max-w-none p-4"
            style={{ minHeight: `${minHeight}px` }}
          >
            {value ? (
              <pre className="whitespace-pre-wrap font-sans">{value}</pre>
            ) : (
              <p className="text-gray-400">{placeholder}</p>
            )}
          </div>
        ) : (
          <textarea
            value={value}
            onChange={handleTextChange}
            placeholder={placeholder}
            className="w-full p-4 border-0 rounded-md resize-none focus:outline-none"
            style={{ minHeight: `${minHeight}px` }}
          />
        )}
      </div>
    </div>
  );
}