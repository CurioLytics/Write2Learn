'use client';

import { useDashboardData } from '@/hooks/dashboard/use-dashboard-data';
import { useAuth } from '@/hooks/auth/use-auth';
import { ProgressCard } from './components/ProgressCard';
import { ErrorAnalysisCard } from './components/ErrorAnalysisCard';
import { DateFilter } from './components/DateFilter';
import { ChatbotModal } from './components/ChatbotModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Target, Calendar, MessageCircle, RefreshCw } from 'lucide-react';
import { useState } from 'react';

export default function ReportPage() {
  const { user } = useAuth();
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  
  const {
    stats,
    errorAnalysis,
    loading,
    errors,
    datePreset,
    updateDateFilter,
    refreshData
  } = useDashboardData(user?.id || null);

  // Loading state
  if (loading.stats && loading.errorAnalysis) {
    return (
      <div className="max-w-6xl mx-auto px-4 space-y-8 py-8">
        <div className="bg-white shadow rounded-2xl p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Report</h1>
          
          <div className="space-y-6">
            {/* Stats Loading */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <Card>
                    <CardContent className="p-6">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>

            {/* Error Analysis Loading */}
            <div className="animate-pulse">
              <Card>
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-32 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (errors.stats && errors.errorAnalysis) {
    return (
      <div className="max-w-6xl mx-auto px-4 space-y-8 py-8">
        <div className="bg-white shadow rounded-2xl p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Report</h1>
          
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Lỗi tải dữ liệu</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {errors.stats && (
                  <p className="text-sm text-red-600">Stats: {errors.stats}</p>
                )}
                {errors.errorAnalysis && (
                  <p className="text-sm text-red-600">Error Analysis: {errors.errorAnalysis}</p>
                )}
              </div>
              <Button 
                onClick={refreshData}
                className="mt-4"
                variant="outline"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Thử lại
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Progress cards data
  const progressCards = [
    {
      id: 1,
      icon: BookOpen,
      value: loading.stats ? 0 : (stats?.totalJournalsCompleted || 0),
      label: 'Bài viết hoàn thành',
      color: 'text-blue-600',
      error: errors.stats
    },
    {
      id: 2,
      icon: Target,
      value: loading.stats ? 0 : (stats?.totalWordsLearned || 0),
      label: 'Từ vựng đã học',
      color: 'text-green-600',
      error: errors.stats
    },
    {
      id: 3,
      icon: Calendar,
      value: loading.stats ? 0 : (stats?.streakDays || 0),
      label: 'Chuỗi ngày học',
      color: 'text-orange-600',
      error: errors.stats
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 space-y-8 py-8">
      {/* Page Header */}
      <div className="bg-white shadow rounded-2xl p-6">
        <h1 className="text-3xl font-bold text-gray-900">Report</h1>
        <p className="mt-2 text-sm text-gray-600">
          Báo cáo tiến độ học tập và phân tích lỗi
        </p>
      </div>

      <div className="space-y-8">
        {/* Stats Section */}
        <div className="bg-white shadow rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4">Tổng quan tiến độ</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {progressCards.map((card) => (
              <ProgressCard
                key={card.id}
                icon={card.icon}
                value={card.value}
                label={card.label}
                color={card.color}
                isLoading={loading.stats}
                error={card.error}
              />
            ))}
          </div>
        </div>

        {/* Error Analysis Section */}
        <div className="bg-white shadow rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <h2 className="text-xl font-semibold">Phân tích lỗi theo kỹ năng</h2>
            <div className="flex items-center gap-2">
              <DateFilter
                currentPreset={datePreset}
                onPresetChange={updateDateFilter}
                className={loading.errorAnalysis ? "opacity-50 pointer-events-none" : ""}
              />
              <Button
                onClick={() => refreshData()}
                variant="outline"
                size="sm"
                disabled={loading.errorAnalysis}
              >
                <RefreshCw className={`w-4 h-4 ${loading.errorAnalysis ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>

          {errors.errorAnalysis ? (
            <Card className="border-red-200">
              <CardContent className="p-6">
                <p className="text-red-600">Lỗi: {errors.errorAnalysis}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Grammar Error Analysis */}
              <ErrorAnalysisCard
                title="Ngữ pháp"
                errors={errorAnalysis || []}
                isLoading={loading.errorAnalysis}
                error={errors.errorAnalysis}
              />
            </div>
          )}
        </div>

        {/* Practice Section */}
        <div className="bg-white shadow rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4">Ôn tập từ lỗi sai</h2>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="font-semibold mb-2">Trò chuyện với AI</h3>
              <p className="text-gray-600 text-sm">
                Luyện tập các kỹ năng cần cải thiện thông qua cuộc trò chuyện tương tác
              </p>
            </div>
            <Button 
              onClick={() => setIsChatbotOpen(true)}
              className="bg-black hover:bg-gray-800 text-white"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Bắt đầu luyện tập
            </Button>
          </div>
        </div>
      </div>

      {/* Chatbot Modal */}
      <ChatbotModal 
        isOpen={isChatbotOpen} 
        onClose={() => setIsChatbotOpen(false)} 
      />
    </div>
  );
}