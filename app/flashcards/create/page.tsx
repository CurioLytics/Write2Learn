'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BreathingLoader } from '@/components/ui/breathing-loader';
import { Flashcard } from '@/types/flashcard';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/auth/use-auth';

export default function FlashcardCreationPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load flashcards from localStorage (created earlier in the flow)
  useEffect(() => {
    try {
      const raw = localStorage.getItem('flashcardData');
      if (!raw) {
        setFlashcards([]);
        setIsLoading(false);
        return;
      }

      const parsed = JSON.parse(raw);
      // Accept the common structures seen previously:
      // - [{ output: [ ... ] }]
      // - { output: [ ... ] }
      // - direct array of flashcards
      let list: any[] = [];

      if (Array.isArray(parsed) && parsed.length > 0 && Array.isArray(parsed[0].output)) {
        list = parsed[0].output;
      } else if (parsed && Array.isArray(parsed.output)) {
        list = parsed.output;
      } else if (Array.isArray(parsed)) {
        list = parsed;
      }

      // Keep only items that look like valid flashcards (minimal checks)
      const valid = list.filter(
        (c: any) =>
          c &&
          typeof c.word === 'string' &&
          c.back &&
          typeof c.back.definition === 'string' &&
          typeof c.back.example === 'string'
      );

      setFlashcards(valid as Flashcard[]);
    } catch (err) {
      setError('Không thể tải flashcard từ bộ nhớ. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // simple editors
  const updateFlashcard = (index: number, patch: Partial<Flashcard>) => {
    setFlashcards((prev) =>
      prev.map((f, i) => (i === index ? { ...f, ...patch, back: { ...f.back, ...(patch.back || {}) } } : f))
    );
  };

  const deleteFlashcard = (index: number) => {
    setFlashcards((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = (cards: Flashcard[]) => {
    if (!cards || cards.length === 0) {
      setError('Không có flashcard để lưu.');
      return false;
    }
    for (let i = 0; i < cards.length; i++) {
      const c = cards[i];
      if (!c.word || !c.back?.definition || !c.back?.example) {
        setError(`Flashcard #${i + 1} chưa đầy đủ. Vui lòng kiểm tra.`);
        return false;
      }
    }
    return true;
  };

  // Save to webhook
  const handleSaveFlashcards = async () => {
    setError(null);
    if (!validate(flashcards)) return;

    setIsSaving(true);

    try {
      const webhookUrl =
        process.env.NEXT_PUBLIC_SAVE_FLASHCARDS_WEBHOOK_URL ||
        'https://auto.zephyrastyle.com/webhook/save-flashcards';

      const payload: any = {
        flashcards: flashcards.map((card) => ({
          front: card.word,
          back: {
            definition: card.back.definition,
            example: card.back.example,
            synonyms: card.back.synonyms || [],
          },
        })),
      };

      if (user?.id) payload.user_id = user.id;

      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(txt || `Server returned ${res.status}`);
      }

      // success: clean up local cache and redirect to vocab hub
      localStorage.removeItem('flashcardData');
      setSaveSuccess(true);

      // give a small moment for user to see success (no assumption about routing)
      setTimeout(() => {
        router.push('/vocab');
      }, 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi khi lưu flashcards.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <BreathingLoader message="Đang chuẩn bị flashcards..." />
      </div>
    );
  }

  if (saveSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Lưu thành công</h2>
          <p className="text-sm text-gray-600 mb-6">Flashcards đã được lưu vào Vocab Hub.</p>
          <div className="flex justify-center gap-3">
            <Button onClick={() => router.push('/vocab')}>Đến Vocab Hub</Button>
            <Button variant="outline" onClick={() => router.push('/flashcards/create')}>
              Tạo thêm
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8" style={{ fontFamily: 'var(--font-sans)' }}>
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold">Tạo Flashcards</h1>
              <p className="text-sm text-gray-500">Kiểm tra và chỉnh sửa trước khi lưu.</p>
            </div>
            <div className="text-sm text-gray-600">{flashcards.length} mục</div>
          </div>

          {error && (
            <div className="mb-4 text-sm text-red-700 bg-red-50 p-3 rounded">{error}</div>
          )}

          <div className="space-y-6">
            {flashcards.length === 0 && (
              <div className="text-center py-12 text-gray-500">Không có flashcard để hiển thị.</div>
            )}

            {flashcards.map((card, idx) => (
              <div key={idx} className="border border-gray-100 rounded-lg p-4 bg-white">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-medium">Vocabulary #{idx + 1}</h3>
                  <button
                    onClick={() => deleteFlashcard(idx)}
                    className="text-gray-500 hover:text-red-600"
                    aria-label={`Xóa flashcard ${idx + 1}`}
                  >
                    🗑️
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Front (Word/Phrase)</label>
                    <textarea
                      value={card.word}
                      onChange={(e) => updateFlashcard(idx, { word: e.target.value })}
                      rows={2}
                      className="w-full p-3 border border-gray-200 rounded focus:outline-none"
                      placeholder="Từ / cụm từ"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Definition</label>
                    <textarea
                      value={card.back.definition}
                      onChange={(e) => updateFlashcard(idx, { back: { ...card.back, definition: e.target.value } })}
                      rows={2}
                      className="w-full p-3 border border-gray-200 rounded focus:outline-none"
                      placeholder="Định nghĩa"
                    />
                    <label className="text-xs text-gray-600 mt-3 mb-1 block">Example (use ___ for blank)</label>
                    <textarea
                      value={card.back.example}
                      onChange={(e) => updateFlashcard(idx, { back: { ...card.back, example: e.target.value } })}
                      rows={2}
                      className="w-full p-3 border border-gray-200 rounded focus:outline-none"
                      placeholder="Ví dụ với ___ cho chỗ trống"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center mt-6 pt-4 border-t">
            <Button variant="outline" onClick={() => router.back()}>
              Quay về
            </Button>

            <Button
              onClick={handleSaveFlashcards}
              disabled={isSaving || flashcards.length === 0}
              className="bg-gray-900 hover:bg-gray-800 text-white"
            >
              {isSaving ? 'Đang lưu...' : 'Lưu vào Vocab Hub'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}