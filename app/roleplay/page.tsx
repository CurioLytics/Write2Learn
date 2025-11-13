'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { RoleplayCard } from '@/components/roleplay/roleplay-card';
import { ScenarioFilter } from '@/components/roleplay/scenario-filter';
import { useRoleplayScenarios } from '@/services/roleplay-service';

export default function RoleplayPage() {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const { scenarios, loading, error } = useRoleplayScenarios(selectedTopic || undefined);

  const handleFilterChange = (topic: string | null) => {
    setSelectedTopic(topic);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 space-y-8 py-8">
      {/* Page Header */}
      <div className="bg-white shadow rounded-2xl p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Role-play</h1>
            <p className="mt-2 text-sm text-gray-600">
              Luyện hội thoại nhập vai trong các tình huống thực tế
            </p>
          </div>
          <Link href="/home" className="text-blue-600 text-sm hover:underline">
            ⬅ Quay lại Home
          </Link>
        </div>

        {/* Bộ lọc chủ đề */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Chọn chủ đề</h2>
          <ScenarioFilter onFilterChange={handleFilterChange} currentTopic={selectedTopic} />
        </div>

        {/* Danh sách roleplay scenario */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Tình huống luyện tập</h2>
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
                  title={s.name}
                  description={s.context}
                  imageUrl={s.image || ''}
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
    </div>
  );
}
