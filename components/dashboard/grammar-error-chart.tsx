'use client';

import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GrammarErrorSummary } from '@/services/analytics-service';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PracticeDialog } from '@/app/report/components/PracticeDialog';
import { ErrorData } from '@/types/exercise';

interface GrammarErrorChartProps {
  data: GrammarErrorSummary[];
  isLoading?: boolean;
}

const ERROR_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#eab308', // yellow
  '#84cc16', // lime
  '#22c55e', // green
  '#10b981', // emerald
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#0ea5e9', // sky
];

export function GrammarErrorChart({ data, isLoading }: GrammarErrorChartProps) {
  const [isPracticeOpen, setIsPracticeOpen] = useState(false);
  const [selectedErrorData, setSelectedErrorData] = useState<ErrorData[]>([]);
  const [grammarTopics, setGrammarTopics] = useState<Record<string, string[]>>({});

  const handlePracticeClick = () => {
    // Build topics structure: { topic_name: [tags] }
    // NOTE: Using topic_name instead of topic_id because some records have null topic_id
    // due to webhook returning IDs that don't exist in grammar_topics table
    const topics: Record<string, string[]> = {};
    
    console.log('🔍 [Chart] Raw data received:', data);
    console.log('🔍 [Chart] Data length:', data.length);
    
    data.forEach((error, index) => {
      console.log(`🔍 [Chart] Processing item ${index}:`, {
        topic_id: error.topic_id,
        topic_name: error.topic_name,
        all_tags: error.all_tags,
        tags_length: error.all_tags?.length || 0,
        tags_is_array: Array.isArray(error.all_tags)
      });
      
      if (error.topic_name && error.all_tags && error.all_tags.length > 0) {
        topics[error.topic_name] = error.all_tags;
        console.log(`✅ [Chart] Added topic: ${error.topic_name} with ${error.all_tags.length} tags`);
      } else {
        console.log(`❌ [Chart] Skipped topic: ${error.topic_name || 'undefined'} (no tags or no topic_name)`);
      }
    });

    console.log('📊 [Chart] Final topics object:', JSON.stringify(topics, null, 2));
    console.log('📊 [Chart] Topics keys:', Object.keys(topics));
    console.log('📊 [Chart] Topics count:', Object.keys(topics).length);
    
    // Map grammar error data to ErrorData format for the practice dialog
    const errorData: ErrorData[] = data.flatMap(error => 
      error.recent_errors.map(description => ({
        topicName: error.topic_name,
        grammarId: error.topic_name, // Use topic_name as fallback since topic_id may be null
        frequency: error.error_count,
        detectedAt: new Date().toISOString(),
        description: description
      }))
    );
    
    console.log('📊 [Chart] Error data count:', errorData.length);
    
    // Pass both errorData and topics structure
    setGrammarTopics(topics);
    setSelectedErrorData(errorData);
    setIsPracticeOpen(true);
  };

  if (isLoading) {
    return (
      <Card className="p-6 bg-white shadow rounded-2xl">
        <div className="h-80 flex items-center justify-center">
          <div className="text-muted-foreground">Đang tải phân tích lỗi...</div>
        </div>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="p-6 bg-white shadow rounded-2xl">
        <div className="h-80 flex flex-col items-center justify-center">
          <div className="text-6xl mb-4">🎉</div>
          <div className="text-lg font-medium">Không có lỗi ngữ pháp!</div>
          <div className="text-sm text-muted-foreground">Bạn làm rất tốt!</div>
        </div>
      </Card>
    );
  }

  // Take top 10 errors for chart
  const chartData = data.slice(0, 10).map(item => ({
    topic: item.topic_name.length > 20 
      ? item.topic_name.substring(0, 20) + '...' 
      : item.topic_name,
    fullTopic: item.topic_name,
    count: item.error_count,
    level: item.topic_level,
    tags: item.all_tags || [],
  }));

  return (
    <Card className="p-6 bg-white shadow rounded-2xl">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">Grammar Error Analysis</h3>
          <p className="text-sm text-muted-foreground">
            Most common grammar issues to focus on
          </p>
        </div>
        <Button
          onClick={handlePracticeClick}
          disabled={!data || data.length === 0}
          size="sm"
          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
        >
          Ôn tập từ lỗi sai
        </Button>
      </div>

      <div className="mb-6">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart 
            data={chartData} 
            layout="vertical"
            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              type="number"
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              allowDecimals={false}
            />
            <YAxis 
              type="category"
              dataKey="topic"
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              width={90}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                padding: '12px',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold', marginBottom: '8px' }}
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const data = payload[0].payload;
                return (
                  <div style={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    padding: '12px',
                    minWidth: '200px',
                  }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '8px', color: 'hsl(var(--foreground))' }}>
                      {data.fullTopic}
                    </div>
                    <div style={{ marginBottom: '8px', color: 'hsl(var(--foreground))' }}>
                      <strong>{data.count}</strong> lỗi
                    </div>
                    {data.tags && data.tags.length > 0 && (
                      <div style={{ marginTop: '8px', borderTop: '1px solid hsl(var(--border))', paddingTop: '8px' }}>
                        <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: 'hsl(var(--muted-foreground))' }}>
                          Tags:
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {data.tags.map((tag: string, idx: number) => (
                            <span
                              key={idx}
                              style={{
                                fontSize: '11px',
                                padding: '2px 8px',
                                backgroundColor: 'hsl(var(--muted))',
                                color: 'hsl(var(--muted-foreground))',
                                borderRadius: '12px',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              }}
            />
            <Bar 
              dataKey="count" 
              radius={[0, 4, 4, 0]}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={ERROR_COLORS[index % ERROR_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Error details accordion */}
      <div className="mt-6 border-t pt-6">
        <h4 className="text-sm font-medium mb-3">Error Details</h4>
        <Accordion type="single" collapsible className="w-full">
          {data.slice(0, 5).map((error, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-sm hover:no-underline">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: ERROR_COLORS[index % ERROR_COLORS.length] }}
                  />
                  <span className="font-medium">{error.topic_name}</span>
                  <span className="text-xs text-muted-foreground ml-auto mr-2">
                    {error.error_count} {error.error_count === 1 ? 'error' : 'errors'}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pl-6 space-y-2">
                  {error.recent_errors.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      {error.recent_errors.map((desc, idx) => (
                        <li key={idx}>{desc}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No error details available</p>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <PracticeDialog
        isOpen={isPracticeOpen}
        onClose={() => setIsPracticeOpen(false)}
        errorData={selectedErrorData}
        grammarTopics={grammarTopics}
      />
    </Card>
  );
}
