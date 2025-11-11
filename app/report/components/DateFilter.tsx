'use client';

import { useState } from 'react';
import { DatePreset } from '@/types/dashboard';
import { getPresetLabel, formatDateRange, getDateRangeFromPreset } from '@/utils/date-utils';

interface DateFilterProps {
  currentPreset: DatePreset;
  onPresetChange: (preset: DatePreset) => void;
  className?: string;
}

const PRESET_OPTIONS: DatePreset[] = [
  'this-week',
  '7-days', 
  '30-days',
  '3-months',
  'all-time'
];

export function DateFilter({ 
  currentPreset, 
  onPresetChange,
  className = ''
}: DateFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handlePresetSelect = (preset: DatePreset) => {
    onPresetChange(preset);
    setIsOpen(false);
  };

  const currentDateRange = getDateRangeFromPreset(currentPreset);

  return (
    <div className={`relative ${className}`}>
      {/* Dropdown trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-between w-full px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
      >
        <div className="flex flex-col items-start">
          <span className="text-sm font-medium text-gray-900">
            {getPresetLabel(currentPreset)}
          </span>
          <span className="text-xs text-gray-500">
            {formatDateRange(currentDateRange)}
          </span>
        </div>
        
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="py-1">
            {PRESET_OPTIONS.map((preset) => {
              const isSelected = preset === currentPreset;
              const dateRange = getDateRangeFromPreset(preset);
              
              return (
                <button
                  key={preset}
                  onClick={() => handlePresetSelect(preset)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150 ${
                    isSelected ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className={`text-sm font-medium ${
                      isSelected ? 'text-blue-700' : 'text-gray-900'
                    }`}>
                      {getPresetLabel(preset)}
                    </span>
                    <span className={`text-xs ${
                      isSelected ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {formatDateRange(dateRange)}
                    </span>
                  </div>
                  
                  {isSelected && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <svg
                        className="w-4 h-4 text-blue-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-0"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}