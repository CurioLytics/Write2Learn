'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { DailyGoalStatus } from '@/services/analytics-service';
import { cn } from '@/utils/ui';
import { useUserProfileStore } from '@/stores/user-profile-store';

interface DailyGoalCardProps {
  data: DailyGoalStatus | null;
  isLoading?: boolean;
}

export function DailyGoalCard({ data, isLoading }: DailyGoalCardProps) {
  const profile = useUserProfileStore(state => state.profile);
  
  // Use cached profile goals or fallback to API data targets
  const goals = [
    { 
      key: 'vocab_created' as const, 
      label: 'Add Vocabulary', 
      icon: '📚', 
      color: 'blue',
      target: profile?.daily_vocab_goal || data?.vocab_created.target || 10
    },
    { 
      key: 'journal_created' as const, 
      label: 'Write Journal', 
      icon: '✍️', 
      color: 'purple',
      target: profile?.daily_journal_goal || data?.journal_created.target || 3
    },
    { 
      key: 'roleplay_completed' as const, 
      label: 'Complete Roleplay', 
      icon: '🎭', 
      color: 'pink',
      target: profile?.daily_roleplay_goal || data?.roleplay_completed.target || 2
    },
  ];

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
    ? goals.filter(goal => {
        const goalData = data[goal.key];
        return goalData.completed >= goal.target;
      }).length
    : 0;

  const totalGoals = goals.length;

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Today's Goals</h3>
        <p className="text-sm text-muted-foreground">
          {totalCompleted} of {totalGoals} completed
        </p>
      </div>

      <div className="space-y-4">
        {goals.map(goal => {
          const completed = data?.[goal.key]?.completed || 0;
          const target = goal.target;
          const isCompleted = completed >= target;
          const progress = Math.min((completed / target) * 100, 100);
          
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
                    {completed}/{target}
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
