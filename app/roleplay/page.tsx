'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { RoleplayCard } from '@/app/roleplay/components/roleplay-card';
import { ScenarioFilter } from '@/app/roleplay/components/scenario-filter';
import { useRoleplayScenarios } from '@/services/client/roleplay-service';

export default function RoleplayPage() {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const { scenarios, loading, error } = useRoleplayScenarios(selectedTopic || undefined);

  const handleFilterChange = (topic: string | null) => {
    setSelectedTopic(topic);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold text-gray-800 flex items-center">
            <span className="text-3xl mr-2">🎭</span> Luyện hội thoại nhập vai
          </h1>
          <Link href="/" className="text-blue-600 text-sm hover:underline">
            ⬅ Quay lại Dashboard
          </Link>
        </div>
        <p className="text-gray-600 text-base">
          Chọn một bối cảnh hội thoại để luyện tập kỹ năng giao tiếp tiếng Anh của bạn.
        </p>
      </div>

      {/* Bộ lọc chủ đề */}
      <ScenarioFilter onFilterChange={handleFilterChange} currentTopic={selectedTopic} />

      {/* Danh sách roleplay scenario */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <div
                  key={`skeleton-${i}`}
                  className="h-40 rounded-xl bg-gray-100 animate-pulse"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {scenarios.map((s) => (
              <RoleplayCard
                key={s.id}
                id={s.id}
                title={s.name}          // mapping giống Dashboard
                description={s.context} // mapping giống Dashboard
                imageUrl={s.image || ''} // mapping giống Dashboard
              />
            ))}
          </div>
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
  );
}
