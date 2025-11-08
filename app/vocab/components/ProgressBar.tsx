"use client";
export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="w-72 h-2 bg-gray-200 rounded-full mb-4">
      <div
        className="h-full bg-black rounded-full transition-all"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}
