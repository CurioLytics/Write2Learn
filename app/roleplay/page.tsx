'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { RoleplayCard } from '@/components/roleplay/roleplay-card';
import { ScenarioFilter } from '@/components/roleplay/scenario-filter';
import { useRoleplayScenarios } from '@/services/api/roleplay-service';

export default function RoleplayPage() {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const { scenarios, loading, error } = useRoleplayScenarios(selectedTopic || undefined);

  const handleFilterChange = (topic: string | null) => {
    setSelectedTopic(topic);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Role-play</h1>
            <p className="mt-2 text-sm text-gray-600">
              Luyện hội thoại nhập vai trong các tình huống thực tế
            </p>
          </div>
          <Link href="/dashboard" className="text-blue-600 text-sm hover:underline">
            ⬅ Quay lại Home
          </Link>
        </div>
      </div>

      {/* Bộ lọc chủ đề */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Chọn chủ đề</h2>
        <ScenarioFilter onFilterChange={handleFilterChange} currentTopic={selectedTopic} />
      </div>

      {/* Danh sách roleplay scenario */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Tình huống luyện tập</h2>
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
