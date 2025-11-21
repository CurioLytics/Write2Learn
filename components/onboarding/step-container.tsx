'use client';

import { ReactNode } from 'react';

interface StepContainerProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function StepContainer({ title, description, children }: StepContainerProps) {
  return (
    <div className="w-full max-w-2xl mx-auto px-6 py-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {title}
        </h2>
        {description && (
          <p className="text-base text-gray-600">
            {description}
          </p>
        )}
      </div>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
}
