'use client';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  return (
    <div className="w-full flex items-center gap-1 px-4">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div
          key={index}
          className={`
            h-1 flex-1 rounded-full transition-all duration-300
            ${index < currentStep ? 'bg-blue-600' : 'bg-gray-200'}
          `}
        />
      ))}
    </div>
  );
}
