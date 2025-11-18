'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { RoleplayCard } from '@/components/roleplay/roleplay-card';
import { ScenarioFilter } from '@/components/roleplay/scenario-filter';
import { SessionHistory } from '@/components/roleplay/session-history';
import { useRoleplayScenarios } from '@/services/roleplay-service';

export default function RoleplayPage() {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const { scenarios, loading, error } = useRoleplayScenarios(selectedTopic || undefined);

  const handleFilterChange = (topic: string | null) => {
    setSelectedTopic(topic);
  };

  return (
    <div className="flex flex-col items-center px-4 space-y-8 py-8">
      {/* Page Header */}
      <div className="bg-white shadow rounded-2xl p-6 flex flex-col w-full max-w-3xl mx-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Role-play</h1>

          </div>
        </div>

        {/* Bộ lọc chủ đề */}
        <div className="mb-6">
          <ScenarioFilter onFilterChange={handleFilterChange} currentTopic={selectedTopic} />
        </div>

        {/* Danh sách roleplay scenario */}
        <div>
          {loading ? (
            <div className="flex overflow-x-auto gap-6 mx-auto max-w-4xl pb-2 cursor-grab" style={{ WebkitOverflowScrolling: 'touch' }}>
              {Array(6)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={`skeleton-${i}`}
                    className="h-40 w-64 rounded-xl bg-gray-100 animate-pulse flex-shrink-0"
                  />
                ))}
            </div>
          ) : error ? (
            <div className="bg-red-50 p-4 rounded-lg text-red-600 text-center">
              <p className="mb-2">Không thể tải danh sách hội thoại. Vui lòng thử lại.</p>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="mt-2"
              >
                Tải lại
              </Button>
            </div>
          ) : scenarios && scenarios.length > 0 ? (
            <>
              <div
                className="flex overflow-x-auto gap-6 mx-auto max-w-4xl pb-2 cursor-grab"
                style={{ WebkitOverflowScrolling: 'touch' }}
                onMouseDown={e => {
                  const slider = e.currentTarget;
                  let isDown = true;
                  let startX = e.pageX - slider.offsetLeft;
                  let scrollLeft = slider.scrollLeft;
                  slider.style.cursor = 'grabbing';
                  const handleMouseMove = (e) => {
                    if (!isDown) return;
                    e.preventDefault();
                    const x = e.pageX - slider.offsetLeft;
                    const walk = (x - startX) * 2;
                    slider.scrollLeft = scrollLeft - walk;
                  };
                  const handleMouseUp = () => {
                    isDown = false;
                    slider.style.cursor = 'grab';
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                  };
                  document.addEventListener('mousemove', handleMouseMove);
                  document.addEventListener('mouseup', handleMouseUp);
                }}
              >
                {scenarios.map((s) => (
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
              {/* Arrow and instruction below the card collection */}
              <div className="flex flex-col justify-center items-center mt-2">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 16H24M24 16L18 10M24 16L18 22" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-xs text-blue-600 mt-1">Kéo sang phải để xem thêm</span>
              </div>
            </>
          ) : (
            <div className="text-center text-gray-600 py-8">
              {selectedTopic ? (
                <>
                  <p className="mb-3">Không có hội thoại nào cho chủ đề "{selectedTopic}".</p>
                  <Button variant="outline" onClick={() => setSelectedTopic(null)}>
                    Xóa bộ lọc
                  </Button>
                </>
              ) : (
                <p>Hiện chưa có hội thoại nào được thêm.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Các role-play đã chơi */}
      <SessionHistory />
    </div>
  );
}
