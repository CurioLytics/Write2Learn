// components/CalendarGrid.tsx

import React from 'react';

// Hardcoded dates for visual representation, matching November 2025
const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const dates: (number | null)[] = [
  null, null, null, null, 1, 2,
  3, 4, 5, 6, 7, 8, 9,
  10, 11, 12, 13, 14, 15, 16,
  17, 18, 19, 20, 21, 22, 23,
  24, 25, 26, 27, 28, 29, 30,
];

const today = 9; // For styling the current date

export const CalendarGrid: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-500">Calendar</h3>
        <select className="bg-white border border-gray-200 rounded-md p-1 text-sm focus:ring-blue-500 focus:border-blue-500">
          <option>November 2025</option>
        </select>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {/* Days of the Week Header */}
        {daysOfWeek.map((day, index) => (
          <div key={index} className="text-sm font-medium text-gray-600 pb-2">
            {day}
          </div>
        ))}

        {/* Calendar Dates */}
        {dates.map((date, index) => {
          if (date === null) {
            return <div key={index} className="h-10"></div>;
          }

          const isToday = date === today;
          const isHighlighted = date === 9; // Highlight the 9th as per the image
          
          let dayClasses = `h-10 w-full flex items-center justify-center rounded-full text-gray-900 transition-colors duration-150`;

          if (isHighlighted) {
            // Dark background for today
            dayClasses += ' bg-gray-800 text-white font-bold';
          } else {
            // General button style
            dayClasses += ' hover:bg-gray-100 text-gray-600';
          }

          return (
            <div key={index} className="flex items-center justify-center p-0.5">
              <button className={dayClasses}>
                {date}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};