'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database.types';
type FlashcardRow = Database['public']['Tables']['flashcard']['Row'];

const supabase = createClientComponentClient<Database>();

type CardRow = {
  flashcard_id: string;
  next_review_at: string | null;
  flashcard?: {
    id: string;
    word: string;
    meaning: string;
    example?: string | null;
    set_id: string;
  } | null;
};

type FlatCard = {
  id: string;
  word: string;
  meaning: string;
  example?: string | null;
  next_review_at?: string | null;
};

type ReviewResult = {
  flashcard_id: string;
  next_review_at: string;
  stability: number;
  difficulty: number;
};

export default function FlashcardsPage() {
  const params = useParams(); // { setId: '...' }
  const setId = params?.setId as string ;

  const [cards, setCards] = useState<FlatCard[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<ReviewResult | null>(null);

  useEffect(() => {
  if (!setId) {
    setError('Missing setId in route parameters.');
    setFetching(false);
    return;
  }

  let mounted = true;
  async function loadDueCards() {
    setFetching(true);
    setError(null);

    const now = new Date().toISOString();
    console.log('[DEBUG] Fetching cards for setId:', setId, 'at', now);

    // 1️⃣ Get all flashcard IDs in that set
    const { data: flashcards, error: fcErr } = await supabase
      .from('flashcard')
      .select('id')
      .eq('set_id', setId);

    if (fcErr) {
      console.error('🔴 Supabase flashcard fetch failed:', fcErr);
      setError(`Supabase error: ${fcErr.message}`);
      setFetching(false);
      return;
    }

    if (!flashcards?.length) {
      setError(`No flashcards found for set ${setId}`);
      setFetching(false);
      return;
    }

    // ✅ Use proper Database type for inference
    const flashcardIds = (flashcards as FlashcardRow[]).map((f) => f.id);

    // 2️⃣ Get their statuses (joined with card info)
    const { data, error: supaErr } = await supabase
      .from('flashcard_status')
      .select(`
        flashcard_id,
        next_review_at,
        flashcard (
          id,
          word,
          meaning,
          example,
          set_id
        )
      `)
      .in('flashcard_id', flashcardIds)
      .lte('next_review_at', now)
      .order('next_review_at', { ascending: true })
      .limit(50);

    if (!mounted) return;

    if (supaErr) {
      console.error('🔴 Supabase query failed:', supaErr);
      setError(
        `Supabase error:
${supaErr.message}
(code: ${supaErr.code ?? 'N/A'})
(hint: ${supaErr.hint ?? 'none'})`
      );
      setCards([]);
      setFetching(false);
      return;
    }

    console.log('[DEBUG] Supabase data returned:', data);

    // ✅ Safe cast using known structure
    const formatted: FlatCard[] =
      (data ?? []).map((d) => {
        const row = d as CardRow;
        const f = row.flashcard;
        return {
          id: f?.id ?? row.flashcard_id,
          word: f?.word ?? '',
          meaning: f?.meaning ?? '',
          example: f?.example ?? null,
          next_review_at: row.next_review_at ?? null,
        };
      }) ?? [];

    setCards(formatted);
    setIndex(0);
    setFlipped(false);
    setFetching(false);
  }

  loadDueCards();
  return () => { mounted = false };
}, [setId]);



  // UI helpers
  const card = cards[index];

  async function handleRate(rating: 1 | 2 | 3 | 4) {
    if (!card) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/review_flashcard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flashcard_id: card.id, rating }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`API error: ${res.status} ${text}`);
      }

      const data: ReviewResult = await res.json();
      setLastResult(data);
    } catch (err: any) {
      console.error('Review API error', err);
      setError(err?.message ?? 'Failed to submit review');
      // Do not stop advancing — but you can if you prefer
    } finally {
      setLoading(false);
      setFlipped(false);
      // advance to next card; if done, keep index at length (to show done UI)
      setIndex((i) => {
        const next = i + 1;
        return next >= cards.length ? next : next;
      });
    }
  }

  if (fetching) {
    return (
      <div className="p-6 text-center">
        <div className="text-gray-600">Loading cards due for review…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (!card || index >= cards.length) {
    return (
      <div className="p-6 flex flex-col items-center gap-4">
        <h2 className="text-xl font-semibold">No more cards due</h2>
        <p className="text-sm text-gray-500">You’ve finished the available cards for this set.</p>
        <button
          className="mt-2 px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
          onClick={() => {
            // reload cards
            setFetching(true);
            setCards([]);
            setIndex(0);
            setFlipped(false);
            setLastResult(null);
            // trigger effect by calling fetch again (simple way)
            // we call same effect by briefly toggling setId? easiest: reload window:
            window.location.reload();
          }}
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Flashcards Review</h1>
          <p className="text-sm text-gray-500">Set: {setId} • {index + 1}/{cards.length}</p>
        </div>
      </div>

      <div
        onClick={() => setFlipped((f) => !f)}
        className={`cursor-pointer rounded-lg border p-8 min-h-[180px] flex flex-col justify-center items-center bg-white shadow ${
          flipped ? 'bg-yellow-50' : 'bg-white'
        }`}
      >
        {!flipped ? (
          <div className="text-2xl font-semibold">{card.word}</div>
        ) : (
          <div className="text-center">
            <div className="text-xl font-medium">{card.meaning}</div>
            {card.example && <p className="mt-3 text-sm text-gray-600 italic">{card.example}</p>}
          </div>
        )}
      </div>

      {flipped && (
        <div className="mt-6 flex gap-3 justify-center">
          <button
            className="px-4 py-2 rounded border text-red-700 hover:bg-red-50 disabled:opacity-50"
            onClick={() => handleRate(1)}
            disabled={loading}
          >
            Again
          </button>
          <button
            className="px-4 py-2 rounded border text-orange-700 hover:bg-orange-50 disabled:opacity-50"
            onClick={() => handleRate(2)}
            disabled={loading}
          >
            Hard
          </button>
          <button
            className="px-4 py-2 rounded border text-green-700 hover:bg-green-50 disabled:opacity-50"
            onClick={() => handleRate(3)}
            disabled={loading}
          >
            Good
          </button>
          <button
            className="px-4 py-2 rounded border text-blue-700 hover:bg-blue-50 disabled:opacity-50"
            onClick={() => handleRate(4)}
            disabled={loading}
          >
            Easy
          </button>
        </div>
      )}

      {lastResult && (
        <div className="mt-6 text-sm text-gray-700">
          <div>Last review result:</div>
          <pre className="bg-gray-100 p-2 rounded mt-2 text-xs overflow-auto">
            {JSON.stringify(lastResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
