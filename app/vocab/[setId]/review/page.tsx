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
import { Button } from '@/components/ui/button';

export default function ReviewPage() {
  const params = useParams<{ setId: string }>();
  const router = useRouter();
  const setId = params.setId;
  const { user } = useAuth();

  const [cards, setCards] = useState<Vocabulary[]>([]);
  // 💡 NEW STATE: Track the loading status
  const [isLoading, setIsLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);

  useEffect(() => {
    if (!setId) return;
    setIsLoading(true);

    fetch(`/api/vocabulary/${setId}/review`)
      .then(res => res.json())
      .then((data) => {
        setCards(data.vocabulary || []);
      })
      .catch((error) => {
        console.error("[❌ API Error] vocabulary review failed:", error);
      })
      .finally(() => {
        setIsLoading(false);
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
      if (!currentCard?.id) {
        toast.error('No card selected');
        return;
      }

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

    setFlipped(false);
    if (current + 1 < cards.length) {
      setCurrent((prev) => prev + 1);
    } else {
      setCompleted(true);
    }

    // Fire-and-forget backend update
    (async () => {
      try {
        const payload = {
          vocabulary_id: (currentCard as any).vocabulary_id,
          rating: numericRating
        };
        const response = await fetch('/api/vocabulary/review', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!response.ok) {
          console.error('Review API Error:', response.status);
        }
      } catch (err) {
        console.error('[❌ Review API Error]', err);
      }
    })();
  }

  // 1. Check Loading State first
  if (isLoading) {
    // 💡 SHOW A LOADING MESSAGE/SPINNER
    return (
      <div className="min-h-screen flex items-center justify-center">
        Đang tìm thẻ...
      </div>
    );
  }

  // 2. Check for "No cards to review" ONLY after loading is complete
  if (!cards.length)
    return <div className="p-8 text-gray-500">No cards to review</div>;

  if (completed)
    return (
      <div className="max-w-3xl mx-auto px-4 space-y-8 py-8">
        <div className="bg-white shadow rounded-2xl p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold">Hoàn thành ôn tập!</h2>
            <button
              className="text-gray-500 hover:text-black text-xl"
              onClick={() => router.push("/vocab")}
            >
              ✕
            </button>
          </div>
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
    <div className="max-w-3xl mx-auto px-4 space-y-8 py-8">
      <div className="bg-white shadow rounded-2xl p-6">
        <div className="flex justify-between items-start mb-6">
          {/* MOVED: Star and Shuffle to the left (first div inside justify-between) */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleShuffle}
              className="p-3 text-gray-600 hover:text-blue-600 transition-colors"
              aria-label="Shuffle front and back"
              title="Exchange front and back content"
            >
              🔀
            </button>
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
          {/* MOVED: Button to the right (second div inside justify-between) */}
          <div className="flex items-center gap-2">
            <Button
              onClick={() => router.push("/vocab")}
              variant="default"
              className=""
            >
              Kết thúc
            </Button>
          </div>
        </div>
        <div className="w-full max-w-md space-y-4 mx-auto mt-4 min-h-[340px]">
          <ProgressBar value={progress} />
          <FlashcardCard
            front={getFrontContent(currentCard)}
            back={getBackContent(currentCard)}
            isFlipped={flipped}
            onFlip={() => setFlipped(!flipped)}
          />
          {flipped && <ReviewControls onRate={handleRating} />}
        </div>
      </div>
    </div>
  );
}