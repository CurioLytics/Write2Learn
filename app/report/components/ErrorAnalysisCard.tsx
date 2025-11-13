'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { ErrorAnalysis } from '@/types/dashboard';
import { ErrorData } from '@/types/exercise';
import { PracticeDialog } from './PracticeDialog';

interface ErrorAnalysisCardProps {
  title: string;
  errors: ErrorAnalysis[];
  isLoading?: boolean;
  error?: string | null;
}

export function ErrorAnalysisCard({ 
  title, 
  errors, 
  isLoading = false,
  error = null 
}: ErrorAnalysisCardProps) {
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [isPracticeOpen, setIsPracticeOpen] = useState(false);
  const [selectedErrorData, setSelectedErrorData] = useState<ErrorData[]>([]);

  const toggleTopic = (topic: string) => {
    const newExpanded = new Set(expandedTopics);
    if (newExpanded.has(topic)) {
      newExpanded.delete(topic);
    } else {
      newExpanded.add(topic);
    }
    setExpandedTopics(newExpanded);
  };

  if (error) {
    return (
      <Card className="p-6 border border-red-200 bg-red-50">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">{title}</h3>
        <div className="text-center py-4">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="p-6 border border-gray-200 bg-white">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">{title}</h3>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600 text-sm">Đang tải...</p>
        </div>
      </Card>
    );
  }

  // Filter only grammar errors and group them
  const grammarErrors = errors.filter(error => error.category === 'grammar');

  if (!grammarErrors || grammarErrors.length === 0) {
    return (
      <Card className="p-6 border border-gray-200 bg-white">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">{title}</h3>
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-gray-600">Chưa có lỗi ngữ pháp nào</p>
        </div>
      </Card>
    );
  }

  // Group errors by topic name for counting and details
  const groupedErrors = grammarErrors.reduce((acc, error) => {
    const topic = error.topicName;
    if (!acc[topic]) {
      acc[topic] = { count: 0, details: [] };
    }
    acc[topic].count += error.frequency;
    acc[topic].details.push(error);
    return acc;
  }, {} as Record<string, { count: number; details: ErrorAnalysis[] }>);

  const sortedTopics = Object.entries(groupedErrors)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 8); // Show top 8

  const handlePracticeClick = () => {
    // Use real error data from error details instead of mock data
    const errorData = sortedTopics.flatMap(([topicName, data]) => 
      data.details.map(detail => ({
        topicName: detail.topicName,
        grammarId: detail.id,
        frequency: detail.frequency,
        detectedAt: detail.detectedAt,
        description: detail.description // Add description from real data
      }))
    );
    
    setSelectedErrorData(errorData);
    setIsPracticeOpen(true);
  };

  return (
    <Card className="p-6 border border-gray-200 bg-white">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={handlePracticeClick}
          disabled={!errors || errors.length === 0}
          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
        >
          Ôn tập từ lỗi sai
        </Button>
      </div>
      
      <div className="space-y-1">
        {sortedTopics.map(([topicName, data]) => (
          <div key={topicName} className="border rounded-lg overflow-hidden">
            <Button
              variant="ghost"
              onClick={() => toggleTopic(topicName)}
              className="w-full flex items-center justify-between p-4 h-auto hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span className="text-gray-900 text-sm font-medium">{topicName}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-700 text-sm font-semibold">
                  {data.count}
                </span>
                {expandedTopics.has(topicName) ? (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                )}
              </div>
            </Button>
            
            {expandedTopics.has(topicName) && (
              <div className="px-4 pb-4 border-t bg-gray-50">
                <div className="space-y-3 mt-3">
                  {data.details.map((detail, index) => (
                    <div key={index} className="text-sm bg-white p-3 rounded border">
                      <p className="text-gray-700 mb-2 font-medium">{detail.description}</p>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Tần suất: {detail.frequency} lần</span>
                        <span>{new Date(detail.detectedAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Practice Dialog */}
      <PracticeDialog 
        isOpen={isPracticeOpen}
        onClose={() => setIsPracticeOpen(false)}
        errorData={selectedErrorData}
      />
    </Card>
  );
}
