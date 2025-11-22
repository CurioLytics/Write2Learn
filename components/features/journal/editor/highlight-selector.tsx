'use client';

import { useEffect, useState, useRef } from 'react';
import { zIndex } from '@/utils/z-index';
import styles from '@/components/features/journal/editor/highlight-selector.module.css';

interface HighlightSelectorProps {
  containerId: string;
  onHighlightSaved: (text: string) => void;
  highlights: string[];
}

export const HighlightSelector: React.FC<HighlightSelectorProps> = ({
  containerId,
  onHighlightSaved,
  highlights
}) => {
  const [isButtonVisible, setIsButtonVisible] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);
  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0 });
  const [selectedText, setSelectedText] = useState('');
  const highlightedTextRefs = useRef<Map<string, HTMLElement[]>>(new Map());
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const selectionTimeout = useRef<NodeJS.Timeout | null>(null);

  const highlightTextInContainer = (text: string, container: HTMLElement) => {
    const textNodes = getAllTextNodes(container);
    const refs: HTMLElement[] = [];
    
    for (const node of textNodes) {
      const nodeText = node.textContent || '';
      const index = nodeText.indexOf(text);
      
      if (index >= 0) {
        try {
          const range = document.createRange();
          range.setStart(node, index);
          range.setEnd(node, index + text.length);
          
          const span = document.createElement('span');
          span.className = styles['highlighted-text'];
          
          range.surroundContents(span);
          refs.push(span);
        } catch (error) {
          console.error('Error highlighting text:', error);
        }
      }
    }
    
    if (refs.length > 0) {
      highlightedTextRefs.current.set(text, refs);
    }
  };
  
  const getAllTextNodes = (element: Node): Text[] => {
    const textNodes: Text[] = [];
    const walk = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null);
    
    let node;
    while ((node = walk.nextNode())) {
      textNodes.push(node as Text);
    }
    
    return textNodes;
  };

  // Synchronize highlights with DOM
  useEffect(() => {
    const container = document.getElementById(containerId);
    if (!container) return;

    const removeUnwantedHighlights = () => {
      const highlightedSpans = container.querySelectorAll(`.${styles['highlighted-text']}`);
      
      highlightedSpans.forEach(span => {
        const text = span.textContent;
        if (text && !highlights.includes(text)) {
          const textNode = document.createTextNode(text);
          span.parentNode?.replaceChild(textNode, span);
        }
      });
    };
    
    const addMissingHighlights = () => {
      highlights.forEach(text => {
        if (text && !highlightedTextRefs.current.has(text)) {
          highlightTextInContainer(text, container);
        }
      });
    };
    
    removeUnwantedHighlights();
    addMissingHighlights();
  }, [highlights, containerId]);

  useEffect(() => {
    const container = document.getElementById(containerId);
    if (!container) return;

    const showSaveButton = () => {
      if (selectionTimeout.current) {
        clearTimeout(selectionTimeout.current);
      }
      
      selectionTimeout.current = setTimeout(() => {
        const selection = window.getSelection();
        
        if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
          setIsButtonVisible(false);
          return;
        }
        
        const text = selection.toString().trim();
        if (!text) {
          setIsButtonVisible(false);
          return;
        }
        
        const range = selection.getRangeAt(0);
        
        if (!container.contains(range.commonAncestorContainer)) {
          setIsButtonVisible(false);
          return;
        }
        
        setSelectedText(text);
        
        const rect = range.getBoundingClientRect();
        const buttonHeight = 40;
        const margin = 8;
        
        const topPosition = rect.top - buttonHeight - margin;
        const leftPosition = rect.left + (rect.width / 2);
        
        setButtonPosition({
          top: Math.max(10, topPosition),
          left: Math.max(10, Math.min(leftPosition, window.innerWidth - 100))
        });
        
        setIsButtonVisible(true);
      }, 100);
    };
    
    const handleMouseUp = (e: MouseEvent) => {
      if (!container.contains(e.target as Node)) return;
      showSaveButton();
    };
    
    const handleTouchStart = (e: TouchEvent) => {
      if (!container.contains(e.target as Node)) return;
      
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
      
      longPressTimer.current = setTimeout(() => {
        const selection = window.getSelection();
        if (selection && !selection.isCollapsed) {
          showSaveButton();
        }
      }, 500);
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
      
      if (!container.contains(e.target as Node)) return;
      
      setTimeout(() => {
        const selection = window.getSelection();
        if (selection && !selection.isCollapsed) {
          showSaveButton();
        }
      }, 10);
    };
    
    const handleTouchMove = () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    };

    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      
      if (
        (buttonRef.current && buttonRef.current.contains(target)) ||
        (container && container.contains(target))
      ) {
        return;
      }
      
      setIsButtonVisible(false);
      setSelectedText('');
    };
    
    container.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick as EventListener, { passive: true });
    
    return () => {
      if (selectionTimeout.current) {
        clearTimeout(selectionTimeout.current);
      }
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
      container.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick as EventListener);
    };
  }, [containerId]);
  
  // Create button element
  const saveButton = (
    <div
      ref={buttonRef}
      className="fixed transition-all duration-150 -translate-x-1/2"
      style={{
        top: `${buttonPosition.top}px`,
        left: `${buttonPosition.left}px`,
        zIndex: zIndex.highlightButton,
        opacity: isButtonVisible ? 1 : 0,
        transform: isButtonVisible ? 'translateX(-50%) scale(1)' : 'translateX(-50%) scale(0.95)',
        pointerEvents: isButtonVisible ? 'auto' : 'none'
      }}
    >
      <button
        onClick={() => {
          onHighlightSaved(selectedText);
          setIsButtonVisible(false);
          setSelectedText('');
          window.getSelection()?.removeAllRanges();
        }}
        className="
          bg-gray-900 text-white text-sm font-medium
          px-3 py-2 rounded-full shadow-lg
          flex items-center gap-1.5
          hover:bg-gray-800 active:scale-95
          focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-700
          whitespace-nowrap
        "
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M5 13l4 4L19 7" />
        </svg>
        Save
      </button>
    </div>
  );

  
  return (
    <>
      {isButtonVisible && saveButton}
    </>
  );
};