'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { ChevronRight, BookOpen, PenLine, MessageSquare } from 'lucide-react';
import { DailyGoalStatus } from '@/types/analytics';
import { cn } from '@/utils/ui';
import { useUserProfileStore } from '@/stores/user-profile-store';
import Link from 'next/link';

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
      icon: BookOpen,
      target: profile?.daily_vocab_goal || data?.vocab_created.target || 10,
      link: '/vocab'
    },
    {
      key: 'journal_created' as const,
      label: 'Write Journal',
      icon: PenLine,
      target: profile?.daily_journal_goal || data?.journal_created.target || 3,
      link: '/journal/new'
    },
    {
      key: 'roleplay_completed' as const,
      label: 'Complete Roleplay',
      icon: MessageSquare,
      target: profile?.daily_roleplay_goal || data?.roleplay_completed.target || 2,
      link: '/roleplay'
    },
  ];

  if (isLoading) {
    return (
      <Card className="p-6 bg-white shadow rounded-2xl">
        <div className="h-64 flex items-center justify-center">
          <div className="text-muted-foreground">Đang tải mục tiêu...</div>
        </div>
      </Card>
    );
  }

  const totalCompleted = data
    ? goals.reduce((sum, goal) => {
      const goalData = data[goal.key];
      return sum + goalData.completed;
    }, 0)
    : 0;

  const totalTarget = goals.reduce((sum, goal) => sum + goal.target, 0);
  const progressPercentage = totalTarget > 0 ? Math.round((totalCompleted / totalTarget) * 100) : 0;

  return (
    <Card className="p-6 bg-white shadow rounded-2xl h-full flex flex-col">
      {/* Header with circular progress */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Daily Plan</h3>
          <p className="text-sm text-gray-500 mt-1">
            {totalCompleted} / {totalTarget} tasks
          </p>
        </div>

        {/* Circular progress indicator */}
        <div className="relative w-16 h-16">
          <svg className="w-16 h-16 transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke="#E5E7EB"
              strokeWidth="6"
              fill="none"
            />
            {/* Progress circle */}
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke="#EF4444"
              strokeWidth="6"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 28}`}
              strokeDashoffset={`${2 * Math.PI * 28 * (1 - progressPercentage / 100)}`}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold text-gray-900">{progressPercentage}%</span>
          </div>
        </div>
      </div>

      {/* Goal items */}
      <div className="space-y-1 flex-1">
        {goals.map(goal => {
          const completed = data?.[goal.key]?.completed || 0;
          const target = goal.target;
          const Icon = goal.icon;

          return (
            <Link key={goal.key} href={goal.link}>
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group">
                <div className="flex items-center gap-3 flex-1">
                  {/* Minimalistic icon */}
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-gray-600" />
                  </div>

                  {/* Goal name */}
                  <span className="text-sm font-medium text-gray-700">
                    {goal.label}
                  </span>
                </div>

                {/* Count and arrow */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-500">
                    {completed} / {target}
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Bottom label */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-center text-gray-400">Daily progress</p>
      </div>
    </Card>
  );
}
