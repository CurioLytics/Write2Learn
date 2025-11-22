'use client';

import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

interface LiveMarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
  className?: string;
}

export interface LiveMarkdownEditorRef {
  insertTextAtCursor: (text: string) => void;
  focus: () => void;
}

/**
 * Shared LiveMarkdownEditor component that handles SSR compatibility
 * and provides a consistent interface for markdown editing across the app
 */
export const LiveMarkdownEditor = forwardRef<LiveMarkdownEditorRef, LiveMarkdownEditorProps>(({
  value,
  onChange,
  placeholder = 'Start writing...',
  minHeight = 300,
  className = '',
}, ref) => {
  const [isClient, setIsClient] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pendingCursorPosition = useRef<{ position: number; scrollTop: number; scrollLeft: number } | null>(null);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Apply pending cursor position after React updates the value
  useEffect(() => {
    if (pendingCursorPosition.current && textareaRef.current) {
      const { position, scrollTop, scrollLeft } = pendingCursorPosition.current;
      textareaRef.current.setSelectionRange(position, position);
      textareaRef.current.scrollTop = scrollTop;
      textareaRef.current.scrollLeft = scrollLeft;
      pendingCursorPosition.current = null;
    }
  }, [value]);

  useImperativeHandle(ref, () => ({
    insertTextAtCursor: (text: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      // Save current scroll position and cursor position
      const scrollTop = textarea.scrollTop;
      const scrollLeft = textarea.scrollLeft;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      const textBefore = value.substring(0, start);
      const textAfter = value.substring(end);
      
      // Add space before text if needed
      const needsSpaceBefore = textBefore.length > 0 && !textBefore.endsWith(' ') && !textBefore.endsWith('\n');
      const finalText = (needsSpaceBefore ? ' ' : '') + text;
      
      const newValue = textBefore + finalText + textAfter;
      const newCursorPos = start + finalText.length;
      
      // Store the desired cursor position and scroll for after React updates
      pendingCursorPosition.current = {
        position: newCursorPos,
        scrollTop,
        scrollLeft
      };
      
      // Trigger React update
      onChange(newValue);
    },
    focus: () => {
      textareaRef.current?.focus();
    }
  }));

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
            ref={textareaRef}
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
});

LiveMarkdownEditor.displayName = 'LiveMarkdownEditor';