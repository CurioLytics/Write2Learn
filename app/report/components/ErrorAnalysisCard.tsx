'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { ErrorAnalysis } from '@/types/dashboard';
import { ErrorData } from '@/types/exercise';
import { PracticeDialog } from './PracticeDialog';

interface ErrorAnalysisCardProps {
  errors: ErrorAnalysis[];
  isLoading?: boolean;
  error?: string | null;
}

export function ErrorAnalysisCard({ 
  errors, 
  isLoading = false,
  error = null 
}: ErrorAnalysisCardProps) {

  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [isPracticeOpen, setIsPracticeOpen] = useState(false);
  const [selectedErrorData, setSelectedErrorData] = useState<ErrorData[]>([]);

  const toggleTopic = (topic: string) => {
    const next = new Set(expandedTopics);
    next.has(topic) ? next.delete(topic) : next.add(topic);
    setExpandedTopics(next);
  };

  if (error) {
    return (
      <Card className="p-5 border border-red-200 bg-red-50">
        <div className="text-center py-4">
          <AlertCircle className="w-7 h-7 text-red-500 mx-auto mb-2" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="p-5 border border-gray-100 bg-white">
        <div className="text-center py-6">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400 mx-auto"></div>
          <p className="mt-2 text-gray-500 text-sm">Đang tải...</p>
        </div>
      </Card>
    );
  }

  const grammarErrors = errors.filter(e => e.category === 'grammar');

  if (!grammarErrors.length) {
    return (
      <Card className="p-5 border border-gray-100 bg-white">
        <div className="text-center py-6">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-gray-600 text-sm">Không có lỗi</p>
        </div>
      </Card>
    );
  }

  const groupedErrors = grammarErrors.reduce((acc, err) => {
    const t = err.topicName;
    acc[t] ||= { count: 0, details: [] };
    acc[t].count += err.frequency;
    acc[t].details.push(err);
    return acc;
  }, {} as Record<string, { count: number; details: ErrorAnalysis[] }>);

  const sortedTopics = Object.entries(groupedErrors)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 8);

  const handlePracticeClick = () => {
    const errorData = sortedTopics.flatMap(([_, data]) =>
      data.details.map(detail => ({
        topicName: detail.topicName,
        grammarId: detail.id,
        frequency: detail.frequency,
        detectedAt: detail.detectedAt,
        description: detail.description
      }))
    );
    setSelectedErrorData(errorData);
    setIsPracticeOpen(true);
  };

  return (
    <Card className="p-5 border border-gray-100 bg-white">
      <div className="flex justify-end mb-4">
        <Button
          variant="default"
          size="sm"
          onClick={handlePracticeClick}
          disabled={!errors.length}
        >
          Ôn tập từ lỗi sai
        </Button>
      </div>

      <div className="space-y-1">
        {sortedTopics.map(([topicName, data]) => (
          <div key={topicName} className="border border-gray-100 rounded-md">
            <Button
              variant="ghost"
              onClick={() => toggleTopic(topicName)}
              className="w-full flex justify-between items-center px-3 py-3 h-auto hover:bg-gray-50"
            >
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                <span className="text-gray-900 text-sm">{topicName}</span>
              </div>

              <div className="flex items-center gap-1">
                <span className="text-gray-700 text-sm">{data.count}</span>
                {expandedTopics.has(topicName) ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </div>
            </Button>

            {expandedTopics.has(topicName) && (
              <div className="px-3 pt-2 pb-3 bg-gray-50 border-t border-gray-100">
                <div className="space-y-2 mt-1">
                  {data.details.map((detail, i) => (
                    <div key={i} className="text-sm p-2 bg-white rounded border border-gray-100">
                      <p className="text-gray-700">{detail.description}</p>
                      <div className="flex justify-end text-xs text-gray-400 mt-1">
                        {new Date(detail.detectedAt).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <PracticeDialog
        isOpen={isPracticeOpen}
        onClose={() => setIsPracticeOpen(false)}
        errorData={selectedErrorData}
      />
    </Card>
  );
}
