'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { RoleplayCard } from '@/components/roleplay/roleplay-card';
import { ScenarioFilter } from '@/components/roleplay/scenario-filter';
import { SessionHistory } from '@/components/roleplay/session-history';
import { useRoleplayScenarios } from '@/hooks/roleplay/use-roleplay-scenarios';

export default function RoleplayPage() {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const { scenarios, loading, error } = useRoleplayScenarios(selectedTopic || undefined);

  const handleFilterChange = (topic: string | null) => {
    setSelectedTopic(topic);
  };

  return (
  <div className="flex flex-col items-center px-4 py-10 w-full">

    {/* HEADER */}
    <div className="w-full max-w-3xl bg-white shadow rounded-2xl p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Role-play</h1>
    </div>

    {/* Add spacing between header and next block */}
    <div className="w-full max-w-3xl space-y-6 mt-10">

      {/* Filter */}
      <ScenarioFilter
        onFilterChange={handleFilterChange}
        currentTopic={selectedTopic}
      />
        {/* Scenarios */}
        {loading ? (
          <div className="flex overflow-x-auto gap-6 pb-2 max-w-full cursor-grab">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-40 w-64 bg-gray-100 animate-pulse rounded-xl flex-shrink-0" />
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-lg text-red-600 text-center">
            <p className="mb-2">Không thể tải danh sách hội thoại.</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Tải lại
            </Button>
          </div>
        ) : scenarios && scenarios.length > 0 ? (
          <>
            <div
              className="flex overflow-x-auto gap-6 pb-2 cursor-grab"
              style={{ WebkitOverflowScrolling: 'touch' }}
              onMouseDown={e => {
                const slider = e.currentTarget;
                let isDown = true;
                let startX = e.pageX - slider.offsetLeft;
                let scrollLeft = slider.scrollLeft;
                slider.style.cursor = 'grabbing';

                const move = (e) => {
                  if (!isDown) return;
                  e.preventDefault();
                  const x = e.pageX - slider.offsetLeft;
                  slider.scrollLeft = scrollLeft - (x - startX) * 2;
                };

                const up = () => {
                  isDown = false;
                  slider.style.cursor = 'grab';
                  document.removeEventListener('mousemove', move);
                  document.removeEventListener('mouseup', up);
                };

                document.addEventListener('mousemove', move);
                document.addEventListener('mouseup', up);
              }}
            >
              {scenarios.map(s => (
                <div key={s.id} className="flex-shrink-0">
                  <RoleplayCard
                    id={s.id}
                    title={s.name}
                    description={s.context}
                    imageUrl={s.image || ''}
                  />
                </div>
              ))}
            </div>

            <div className="flex flex-col justify-center items-center mt-2">
              <svg width="32" height="32" viewBox="0 0 32 32">
                <path d="M8 16H24M24 16L18 10M24 16L18 22"
                  stroke="#2563eb" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round"
                />
              </svg>
              <span className="text-xs text-blue-600 mt-1">Kéo sang phải để xem thêm</span>
            </div>
          </>
        ) : (
          <div className="text-center text-gray-600 py-8">
            {selectedTopic ? (
              <>
                <p className="mb-3">Không có hội thoại nào cho "{selectedTopic}".</p>
                <Button variant="outline" onClick={() => setSelectedTopic(null)}>
                  Xóa bộ lọc
                </Button>
              </>
            ) : (
              <p>Hiện chưa có hội thoại nào.</p>
            )}
          </div>
        )}

      </div>

      {/* History */}
      <div className="w-full max-w-3xl mt-10">
        <SessionHistory />
      </div>
    </div>
  );
}
