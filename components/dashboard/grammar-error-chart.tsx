'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card } from '@/components/ui/card';
import { GrammarErrorSummary } from '@/services/analytics-service';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

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
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="h-80 flex items-center justify-center">
          <div className="text-muted-foreground">Loading error analysis...</div>
        </div>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="p-6">
        <div className="h-80 flex flex-col items-center justify-center">
          <div className="text-6xl mb-4">🎉</div>
          <div className="text-lg font-medium">No grammar errors found!</div>
          <div className="text-sm text-muted-foreground">Keep up the great work!</div>
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
  }));

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Grammar Error Analysis</h3>
        <p className="text-sm text-muted-foreground">
          Most common grammar issues to focus on
        </p>
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
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              formatter={(value, name, props) => [
                `${value} errors`,
                props.payload.fullTopic
              ]}
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
    </Card>
  );
}
