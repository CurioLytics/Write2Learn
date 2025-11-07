"use client";
export function FlashcardCard({
  front,
  back,
  isFlipped,
  onFlip,
}: {
  front: string;
  back: string;
  isFlipped: boolean;
  onFlip: () => void;
}) {
  return (
    <div
      onClick={onFlip}
      // Increased size from w-72 h-48 to w-80 h-56
      className={`w-80 h-56 cursor-pointer flex items-center justify-center text-center text-lg font-medium rounded-xl shadow-sm transition-transform ${
        isFlipped ? "bg-gray-100 rotate-y-180" : "bg-white"
      }`}
    >
      {/* Added p-4 padding for more margin around the text */}
      <div className={`p-4 ${isFlipped ? "transform rotate-y-180" : ""}`}>
        {isFlipped ? back : front}
      </div>
    </div>
  );
}