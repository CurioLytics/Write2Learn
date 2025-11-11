'use client';

import { useState } from 'react';

export default function ReviewTestPage() {
  const [flashcardId, setFlashcardId] = useState('');
  const [rating, setRating] = useState(3);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!flashcardId) return alert('Enter flashcard ID');

    setLoading(true);
    try {
      const res = await fetch('/api/review_flashcard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flashcard_id: flashcardId, rating }),
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      alert('Failed to call API');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h1 className="text-3xl font-bold text-gray-900">FSRS Review Test</h1>

      <label>Flashcard ID:</label>
      <input
        type="text"
        value={flashcardId}
        onChange={(e) => setFlashcardId(e.target.value)}
        placeholder="Enter flashcard UUID"
        style={{ width: '100%', marginBottom: 10 }}
      />

      <label>Rating (1=Again, 2=Hard, 3=Good, 4=Easy):</label>
      <input
        type="number"
        value={rating}
        min={1}
        max={4}
        onChange={(e) => setRating(Number(e.target.value))}
        style={{ width: '100%', marginBottom: 20 }}
      />

      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          padding: '8px 16px',
          background: '#0070f3',
          color: 'white',
          border: 'none',
          borderRadius: 6,
          cursor: 'pointer',
        }}
      >
        {loading ? 'Processing...' : 'Submit Review'}
      </button>

      {result && (
        <div style={{ marginTop: 20 }}>
          <h3>Result:</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
