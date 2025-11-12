'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useResponsive } from '@/hooks/common/use-responsive';
import { zIndex } from '@/utils/z-index';
import styles from '@/components/features/journal/editor/highlight-selector.module.css';

interface HighlightSelectorProps {
  containerId: string;
  onHighlightSaved: (text: string) => void;
  highlights: string[]; // Add the current highlights array from parent
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
  // Track which highlights are currently displayed in the DOM
  const highlightedTextRefs = useRef<Map<string, HTMLElement[]>>(new Map());
  // Get responsive state
  const { isMobile, isDesktop } = useResponsive();

  // Function to highlight text in the container
  const highlightTextInContainer = (text: string, container: HTMLElement) => {
    // Get all text nodes in the container
    const textNodes = getAllTextNodes(container);
    const refs: HTMLElement[] = [];
    
    for (const node of textNodes) {
      const nodeText = node.textContent || '';
      const index = nodeText.indexOf(text);
      
      if (index >= 0) {
        try {
          // Split the text node and insert a highlighted span
          const range = document.createRange();
          range.setStart(node, index);
          range.setEnd(node, index + text.length);
          
          const span = document.createElement('span');
          span.className = styles['highlighted-text'];
          
          range.surroundContents(span);
          refs.push(span);
          console.log('Text highlighted successfully:', text);
        } catch (error) {
          console.error('Error highlighting text:', error);
        }
      }
    }
    
    if (refs.length > 0) {
      // Store references to this highlight's DOM elements
      highlightedTextRefs.current.set(text, refs);
    }
  };
  
  // Get all text nodes in a container
  const getAllTextNodes = (element: Node): Text[] => {
    const textNodes: Text[] = [];
    
    const walk = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null
    );
    
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

    // Function to remove highlights that are not in the highlights array
    const removeUnwantedHighlights = () => {
      // Get all highlighted spans in the container
      const highlightedSpans = container.querySelectorAll(`.${styles['highlighted-text']}`);
      
      highlightedSpans.forEach(span => {
        const text = span.textContent;
        if (text && !highlights.includes(text)) {
          // This highlight is no longer in the array, remove the highlight styling
          const textNode = document.createTextNode(text);
          span.parentNode?.replaceChild(textNode, span);
        }
      });
    };
    
    // Function to add highlights that are in the array but not in the DOM
    const addMissingHighlights = () => {
      // Only process highlights not already tracked
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
    if (!container) {
      console.error(`Container with id ${containerId} not found`);
      return;
    }

    console.log('Setting up highlight selector for container:', containerId);
    
    // Track selection timeout to debounce multiple events
    let selectionTimeout: NodeJS.Timeout | null = null;

    // Function to handle text selection
    const handleSelection = () => {
      // Clear any pending selection handler
      if (selectionTimeout) {
        clearTimeout(selectionTimeout);
      }
      
      // Debounce selection handling to prevent multiple rapid calls
      selectionTimeout = setTimeout(() => {
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
        
        // Check if selection is within our container
        if (!container.contains(range.commonAncestorContainer)) {
          setIsButtonVisible(false);
          return;
        }
        
        // Store selected text
        setSelectedText(text);
        
        // Calculate button position
        const rect = range.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        // Position the button above the selected text
        const buttonHeight = 40; // Approximate button height
        const margin = 8; // Small margin above the selection
        
        // Calculate position relative to viewport (not container)
        const topPosition = rect.top - buttonHeight - margin;
        const leftPosition = rect.left + (rect.width / 2);
        
        setButtonPosition({
          top: Math.max(10, topPosition), // Ensure it doesn't go above viewport
          left: Math.max(10, Math.min(leftPosition, window.innerWidth - 100)) // Keep within viewport bounds
        });
        
        setIsButtonVisible(true);
      }, 100);
    };
    
    // Handle mouseup to detect selections
    const handleMouseUp = (e: MouseEvent) => {
      // Only handle if the click was within our container
      if (!container.contains(e.target as Node)) return;
      handleSelection();
    };
    
    // Handle touchend for mobile devices
    const handleTouchEnd = (e: TouchEvent) => {
      // Only handle if the touch was within our container
      if (!container.contains(e.target as Node)) return;
      handleSelection();
    };

    // Handle clicks/touches outside to hide the button
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      
      // Don't hide if clicking the save button or within container
      if (
        (buttonRef.current && buttonRef.current.contains(target)) ||
        (container && container.contains(target))
      ) {
        return;
      }
      
      setIsButtonVisible(false);
      setSelectedText('');
    };
    
    // Add event listeners - only using mouseup/touchend, not selectionchange
    container.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('touchend', handleTouchEnd, { passive: true });
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick as EventListener, { passive: true });
    
    // Cleanup
    return () => {
      if (selectionTimeout) {
        clearTimeout(selectionTimeout);
      }
      container.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick as EventListener);
    };
  }, [containerId, onHighlightSaved, selectedText]);
  
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
          console.log('✅ Saved highlight:', selectedText);
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
      {/* Render the save button */}
      {isButtonVisible && saveButton}
    </>
  );
};