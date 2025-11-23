'use client';

interface OptionButtonProps {
  label: string;
  description?: string;
  selected: boolean;
  onClick: () => void;
}

export function OptionButton({ label, description, selected, onClick }: OptionButtonProps) {
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
      <div className="font-medium">{label}</div>
      {description && (
        <div className={`text-sm mt-1 ${selected ? 'text-blue-100' : 'text-gray-600'}`}>
          {description}
        </div>
      )}
    </button>
  );
}
