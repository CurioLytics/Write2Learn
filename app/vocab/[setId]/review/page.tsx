"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Vocabulary } from "@/types/vocabulary";
import { FlashcardCard } from "../../components/Flashcard";
import { ReviewControls } from "../../components/ReviewControls";
import { ProgressBar } from "../../components/ProgressBar";
import { toggleVocabularyStar } from '@/utils/star-helpers';
import { useAuth } from '@/hooks/auth/use-auth';
import { toast } from 'sonner';

export default function ReviewPage() {
  const params = useParams<{ setId: string }>();
  const router = useRouter();
  const setId = params.setId;
  const { user } = useAuth();

  const [cards, setCards] = useState<Vocabulary[]>([]);
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);

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

  const handleShuffle = () => {
    setIsShuffled(!isShuffled);
    setFlipped(false); // Reset flip state when shuffling
  };

  // Get the front and back content based on shuffle state
  const getFrontContent = (card: Vocabulary) => isShuffled ? card.meaning : card.word;
  const getBackContent = (card: Vocabulary) => isShuffled ? card.word : card.meaning;

  // Star toggle function
  const handleStarToggle = async () => {
    if (!user || !currentCard) {
      toast.error('Please log in to star vocabulary');
      return;
    }

    try {
      const newStarredStatus = await toggleVocabularyStar(currentCard.id);
      
      // Update local state
      setCards(prev => prev.map(card => 
        card.id === currentCard.id 
          ? { ...card, is_starred: newStarredStatus }
          : card
      ));
      
      toast.success(newStarredStatus ? 'Starred' : 'Unstarred');
    } catch (error: any) {
      console.error('Error toggling star:', error);
      toast.error(error.message);
    }
  };

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

    console.log('[🔍 DEBUG] Submitting review:', { 
      vocabulary_id: (currentCard as any).vocabulary_id, 
      rating: numericRating,
      currentCard 
    });

    try {
      const payload = { 
        vocabulary_id: (currentCard as any).vocabulary_id, 
        rating: numericRating 
      };
      
      console.log('[📡 REQUEST] Sending to /api/vocabulary/review:', payload);

      const response = await fetch('/api/vocabulary/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));
      
      console.log('[📥 RESPONSE]', response.status, result);
      
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

        {/* Shuffle and Star buttons */}
        <div className="flex justify-center items-center gap-4">
          <button
            onClick={handleShuffle}
            className="p-3 text-gray-600 hover:text-blue-600 transition-colors"
            aria-label="Shuffle front and back"
            title="Exchange front and back content"
          >
            🔀
          </button>
          
          {/* Star button */}
          {currentCard && (
            <button
              onClick={handleStarToggle}
              className={`p-3 transition-colors ${
                currentCard.is_starred 
                  ? 'text-yellow-500 hover:text-yellow-600' 
                  : 'text-gray-400 hover:text-yellow-500'
              }`}
              aria-label={currentCard.is_starred ? 'Unstar word' : 'Star word'}
              title={currentCard.is_starred ? 'Remove from favorites' : 'Add to favorites'}
            >
              {currentCard.is_starred ? '⭐' : '☆'}
            </button>
          )}
        </div>

        <FlashcardCard
          front={getFrontContent(currentCard)}
          back={getBackContent(currentCard)}
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