'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { DailyGoalStatus } from '@/services/analytics-service';
import { cn } from '@/utils/ui';

interface DailyGoalCardProps {
  data: DailyGoalStatus | null;
  isLoading?: boolean;
}

const GOALS = [
  { key: 'vocab_created', label: 'Add Vocabulary', icon: '📚', color: 'blue' },
  { key: 'journal_created', label: 'Write Journal', icon: '✍️', color: 'purple' },
  { key: 'roleplay_completed', label: 'Complete Roleplay', icon: '🎭', color: 'pink' },
] as const;

export function DailyGoalCard({ data, isLoading }: DailyGoalCardProps) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="h-64 flex items-center justify-center">
          <div className="text-muted-foreground">Loading goals...</div>
        </div>
      </Card>
    );
  }

  const totalCompleted = data
    ? GOALS.filter(goal => {
        const goalData = data[goal.key];
        return goalData.completed >= goalData.target;
      }).length
    : 0;

  const totalGoals = GOALS.length;

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Today's Goals</h3>
        <p className="text-sm text-muted-foreground">
          {totalCompleted} of {totalGoals} completed
        </p>
      </div>

      <div className="space-y-4">
        {GOALS.map(goal => {
          const goalData = data?.[goal.key] || { completed: 0, target: 0 };
          const isCompleted = goalData.completed >= goalData.target;
          const progress = Math.min((goalData.completed / goalData.target) * 100, 100);
          
          return (
            <div key={goal.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{goal.icon}</span>
                  <span className="text-sm font-medium">{goal.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-sm font-semibold",
                    isCompleted ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
                  )}>
                    {goalData.completed}/{goalData.target}
                  </span>
                  {isCompleted && (
                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all duration-500 rounded-full",
                    isCompleted
                      ? "bg-green-500"
                      : "bg-gradient-to-r from-blue-500 to-purple-500"
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {totalCompleted === totalGoals && (
        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-lg border border-green-200 dark:border-green-800">
          <p className="text-sm font-medium text-green-900 dark:text-green-100 text-center">
            🎉 Amazing! You've completed all goals today!
          </p>
        </div>
      )}
    </Card>
  );
}
