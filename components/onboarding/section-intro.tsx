'use client';

interface SectionIntroProps {
  title: string;
  description: string;
}

export function SectionIntro({ title, description }: SectionIntroProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center animate-in fade-in duration-500">
      <h1 className="text-5xl font-bold text-gray-900 mb-4 tracking-tight">
        {title}
      </h1>
      <p className="text-lg text-gray-600 max-w-md">
        {description}
      </p>
    </div>
  );
}
