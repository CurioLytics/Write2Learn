'use client';

interface OptionButtonProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

export function OptionButton({ label, selected, onClick }: OptionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full px-6 py-4 rounded-2xl text-left transition-all duration-200
        font-normal text-base
        ${
          selected
            ? 'bg-blue-600 text-white shadow-md'
            : 'bg-gray-50 text-gray-800 hover:bg-gray-100'
        }
      `}
    >
      {label}
    </button>
  );
}
