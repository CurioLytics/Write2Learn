// components/StatCard.tsx

import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-between h-40">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <div className="text-4xl font-light text-gray-900 mt-2">
        {value}
      </div>
    </div>
  );
};