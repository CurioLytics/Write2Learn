import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { ChevronDown, ChevronUp, AlertCircle, Calendar } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ErrorAnalysis } from '@/types/dashboard';
import { formatDistanceToNow } from '@/utils/date-utils';

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
  const [expandedError, setExpandedError] = useState<string | null>(null);

  if (error) {
    return (
      <Card className="p-6 border border-red-200 bg-red-50">
        <h3 className="mb-4 text-gray-900">{title}</h3>
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
        <h3 className="mb-4 text-gray-900">{title}</h3>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600 text-sm">Đang tải...</p>
        </div>
      </Card>
    );
  }

  if (!errors || errors.length === 0) {
    return (
      <Card className="p-6 border border-gray-200 bg-white">
        <h3 className="mb-4 text-gray-900">{title}</h3>
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-gray-600">Chưa có lỗi nào được ghi nhận</p>
        </div>
      </Card>
    );
  }

  // Group errors by category for this title
  const categoryErrors = errors.filter(error => 
    title.toLowerCase() === 'ngữ pháp' 
      ? error.category === 'grammar'
      : error.category === 'vocab'
  );

  // Group by topic name
  const groupedErrors = categoryErrors.reduce((groups, error) => {
    const topic = error.topicName;
    if (!groups[topic]) {
      groups[topic] = [];
    }
    groups[topic].push(error);
    return groups;
  }, {} as Record<string, ErrorAnalysis[]>);

  const sortedTopics = Object.entries(groupedErrors)
    .sort(([,a], [,b]) => b.length - a.length); // Sort by error count descending

  return (
    <Card className="p-6 border border-gray-200 rounded-lg bg-white">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-gray-900">{title}</h3>
        <span className="text-sm text-gray-500">
          {categoryErrors.length} lỗi
        </span>
      </div>
      
      <div className="space-y-3">
        {sortedTopics.map(([topicName, topicErrors]) => (
          <Collapsible
            key={topicName}
            open={expandedError === topicName}
            onOpenChange={(isOpen) => setExpandedError(isOpen ? topicName : null)}
          >
            <div className="group">
              <CollapsibleTrigger className="w-full text-left">
                <div className="flex items-center justify-between hover:bg-gray-50 p-3 rounded-md transition-colors">
                  <div className="flex items-center gap-3 flex-1">
                    <AlertCircle className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-900">{topicName}</span>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <span className="text-gray-700 text-sm">
                      {topicErrors.length} lỗi
                    </span>
                    
                    {expandedError === topicName ? (
                      <ChevronUp className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    )}
                  </div>
                </div>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <div className="mt-2 ml-10 space-y-3">
                  {topicErrors.map((error) => (
                    <div
                      key={error.id}
                      className="p-4 bg-gray-50 rounded-md border border-gray-200"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-xs text-gray-500 uppercase tracking-wider">
                          {error.category}
                        </span>
                        {error.detectedAt && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Calendar className="w-3 h-3" />
                            {formatDistanceToNow(new Date(error.detectedAt))}
                          </div>
                        )}
                      </div>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {error.description}
                      </p>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        ))}
      </div>
    </Card>
  );
}
