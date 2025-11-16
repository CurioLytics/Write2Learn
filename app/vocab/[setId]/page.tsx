"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Vocabulary } from "@/types/vocabulary";
import { FlashcardCard } from "../components/Flashcard";
import { ReviewControls } from "../components/ReviewControls";
import { ProgressBar } from "../components/ProgressBar";

export default function ReviewPage() {
  const params = useParams<{ setId: string }>();
  const router = useRouter();
  const setId = params.setId;

  const [cards, setCards] = useState<Vocabulary[]>([]);
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!setId) return;

    console.log("[🔹 ReviewPage] Loading vocabulary for set:", setId);

    // Use the vocabulary API endpoint
    fetch(`/api/vocabulary/${setId}/review`)
      .then(res => res.json())
      .then((data) => {
        console.log("[✅ API Success] vocabulary review returned:", data);
        setCards(data.vocabulary || []);
      })
      .catch((error) => {
        console.error("[❌ API Error] vocabulary review failed:", error);
      });
  }, [setId]);

  const currentCard = cards[current];
  const progress = cards.length ? ((current + 1) / cards.length) * 100 : 0;

  async function handleRating(rating: string) {
    if (!currentCard) return;

    // Convert string rating to number for FSRS
    const ratingMap: Record<string, number> = {
      'again': 1,
      'hard': 2,
      'good': 3,
      'easy': 4
    };

    const numericRating = ratingMap[rating];
    if (!numericRating) {
      console.error('Invalid rating:', rating);
      return;
    }

    try {
      const response = await fetch('/api/vocabulary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vocabulary_id: currentCard.vocabulary_id, rating: numericRating }),
      });

      const result = await response.json().catch(() => ({}));
      
      if (!response.ok) {
        console.error('Review API Error:', response.status, result);
        return;
      }
    } catch (err) {
      console.error("[❌ Review API Error]", err);
    }

    setFlipped(false);

    // Move to next card or mark completed
    if (current + 1 < cards.length) {
      setCurrent((prev) => prev + 1);
    } else {
      setCompleted(true);
    }
  }

  if (!cards.length)
    return <div className="p-8 text-gray-500">No cards to review</div>;

  if (completed)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50 text-center">
        <div className="bg-white p-8 rounded-xl shadow-md">
          <h2 className="text-2xl font-bold mb-4">Hoàn thành ôn tập!</h2>
          <button
            className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl"
            onClick={() => router.push("/vocab")}
          >
            ✕
          </button>
          <button
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => router.push("/vocab")}
          >
            Quay lại vocab
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50">
      <div className="w-full max-w-md space-y-4">
        <ProgressBar value={progress} />

        <FlashcardCard
          front={currentCard.word}
          back={currentCard.meaning}
          isFlipped={flipped}
          onFlip={() => {
            console.log("[↩️ Flip Card]", !flipped ? "show back" : "show front");
            setFlipped(!flipped);
          }}
        />

        {flipped && <ReviewControls onRate={handleRating} />}

        {/* Kết thúc button luôn hiển thị */}
        <button
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          onClick={() => router.push("/vocab")}
        >
          Kết thúc
        </button>
      </div>
    </div>
  );
}
