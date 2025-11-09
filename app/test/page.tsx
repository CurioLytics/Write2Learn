// components/JournalDashboard.tsx

import React from 'react';
import { StatCard } from './components/StatCard';
import { CalendarGrid } from './components/CalendarGrid';

export const JournalDashboard: React.FC = () => {
  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        
        {/* Left Section: Stats (takes 2/3 width on large screens) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center text-gray-500">
            <h2 className="text-xl font-semibold">Habit tracking</h2>
            <select className="bg-white border border-gray-200 rounded-md p-1 text-sm focus:ring-blue-500 focus:border-blue-500">
              <option>All time</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <StatCard title="Total journaling time" value="27 seconds" />
            <StatCard title="Longest streak" value="1 day" />
            <StatCard title="Entries" value="1" />
          </div>
        </div>

        {/* Right Section: Calendar (takes 1/3 width on large screens) */}
        <div className="lg:col-span-1">
          <CalendarGrid />
        </div>
      </div>
    </div>
  );
};