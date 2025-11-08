interface FlashCardProps {
  front: string;
  back: string;
  isFlipped: boolean;
  onFlip: () => void;
}

export function FlashcardCard({ front, back, isFlipped, onFlip }: FlashCardProps) {
  return (
    <div className="relative w-80 h-56" style={{ perspective: "1000px" }}>
      <div
        className={`w-full h-full relative cursor-pointer transition-transform duration-600 ease-in-out hover:scale-105`}
        onClick={onFlip}
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front of card */}
        <div
          className="absolute inset-0 flex items-center justify-center p-6 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.16)] transition-shadow border border-gray-200"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="absolute top-4 left-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <span className="text-xs text-gray-400">Q</span>
          </div>
          <p className="text-center px-4">{front}</p>
        </div>

        {/* Back of card */}
        <div
          className="absolute inset-0 flex items-center justify-center p-6 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.16)] transition-shadow border border-gray-200"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div className="absolute top-4 left-4 w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center">
            <span className="text-xs text-white">A</span>
          </div>
          <p className="text-center px-4">{back}</p>
        </div>
      </div>
    </div>
  );
}
