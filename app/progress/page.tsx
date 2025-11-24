'use client';

import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/hooks/auth/use-auth';
import { useAnalytics } from '@/hooks/dashboard/useAnalytics';
import { WeeklyActivityChart } from '@/components/dashboard/weekly-activity-chart';
import { DailyGoalCard } from '@/components/dashboard/daily-goal-card';
import { GrammarErrorChart } from '@/components/dashboard/grammar-error-chart';
import { ProgressCalendar } from '@/components/dashboard/progress-calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw, Flame, TrendingUp } from 'lucide-react';
import { cn } from '@/utils/ui';
import { DailyGoalStatus } from '@/services/analytics-service';

type DatePreset = '7days' | '30days' | '90days' | 'all';

const DATE_PRESETS = [
  { value: '7days' as DatePreset, label: '7 Days', days: 7 },
  { value: '30days' as DatePreset, label: '30 Days', days: 30 },
  { value: '90days' as DatePreset, label: '90 Days', days: 90 },
  { value: 'all' as DatePreset, label: 'All Time', days: 365 },
];

export default function ProgressPage() {
  const { user } = useAuth();
  const [datePreset, setDatePreset] = useState<DatePreset>('7days');
  const [monthlyGoals, setMonthlyGoals] = useState<Map<string, DailyGoalStatus>>(new Map());
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(true);

  // Memoize date range calculation to prevent infinite loops
  const { startDate, endDate } = useMemo(() => {
    const endDate = new Date();
    const daysAgo = DATE_PRESETS.find(p => p.value === datePreset)?.days || 7;
    const startDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    return { startDate, endDate };
  }, [datePreset]);

  const { data, isLoading, error, refetch } = useAnalytics({ startDate, endDate });

  // Fetch monthly goal statuses for calendar
  useEffect(() => {
    async function fetchMonthlyGoals() {
      if (!user?.id) return;
      
      setIsLoadingCalendar(true);
      try {
        const response = await fetch('/api/analytics/monthly-goals');
        const result = await response.json();
        
        if (result.success && result.data?.goalStatuses) {
          // Convert object back to Map
          const statusMap = new Map(Object.entries(result.data.goalStatuses));
          setMonthlyGoals(statusMap);
        }
      } catch (err) {
        console.error('Error fetching monthly goals:', err);
      } finally {
        setIsLoadingCalendar(false);
      }
    }

    fetchMonthlyGoals();
  }, [user?.id]);

  // Loading state
  if (isLoading && !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Progress</h1>
              <p className="text-muted-foreground mt-1">Track your learning journey</p>
            </div>
          </div>

          {/* Loading skeletons */}
          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <Card>
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-8 bg-muted rounded w-1/2"></div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="animate-pulse">
              <Card>
                <CardContent className="p-6">
                  <div className="h-80 bg-muted rounded"></div>
                </CardContent>
              </Card>
            </div>
            <div className="animate-pulse">
              <Card>
                <CardContent className="p-6">
                  <div className="h-80 bg-muted rounded"></div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">Progress</h1>
          
          <Card className="border-destructive">
            <CardContent className="p-6">
              <p className="text-destructive mb-4">Failed to load progress data: {error.message}</p>
              <Button onClick={refetch} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const streak = data?.streak;
  const isStreakActive = streak && streak.current_streak > 0;

  return (
    <div className="flex flex-col items-center px-4 py-10 w-full">
      {/* HEADER */}
      <div className="w-full max-w-6xl bg-white shadow rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Progress</h1>
            <p className="mt-2 text-sm text-gray-600">
              Track your learning journey and daily achievements
            </p>
          </div>
          
          <Button onClick={refetch} variant="outline" size="sm" className="border-blue-600 text-blue-600 hover:bg-blue-50">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="w-full max-w-6xl space-y-6">
        {/* Date Filter */}
        <div className="flex gap-2 flex-wrap">
          {DATE_PRESETS.map((preset) => (
            <Button
              key={preset.value}
              variant={datePreset === preset.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDatePreset(preset.value)}
              className={datePreset === preset.value ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'border-blue-600 text-blue-600 hover:bg-blue-50'}
            >
              {preset.label}
            </Button>
          ))}
        </div>

        {/* Streak Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className={cn(
            "relative overflow-hidden bg-white shadow rounded-2xl",
            isStreakActive && "border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50"
          )}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-3 rounded-full",
                  isStreakActive ? "bg-orange-100" : "bg-gray-100"
                )}>
                  <Flame className={cn(
                    "w-6 h-6",
                    isStreakActive ? "text-orange-500" : "text-gray-400"
                  )} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Current Streak</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {streak?.current_streak || 0} {streak?.current_streak === 1 ? 'day' : 'days'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-blue-100">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Longest Streak</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {streak?.longest_streak || 0} {streak?.longest_streak === 1 ? 'day' : 'days'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-blue-100">
                  <RefreshCw className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Last Active</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {streak?.last_active_date 
                      ? new Date(streak.last_active_date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Charts Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Daily Goals and Calendar - Takes 1 column */}
          <div className="lg:col-span-1 space-y-6">
            <DailyGoalCard 
              data={data?.dailyGoal || null} 
              isLoading={isLoading} 
            />
            
            {/* Calendar - Below Daily Goals */}
            <Card className="bg-white shadow rounded-2xl">
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Activity Calendar</h3>
                <p className="text-xs text-gray-600 mb-3">
                  Days with all goals completed are bold
                </p>
                {isLoadingCalendar ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <ProgressCalendar 
                    goalStatuses={monthlyGoals}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Weekly Activity - Takes 2 columns */}
          <div className="lg:col-span-2">
            <WeeklyActivityChart 
              data={data?.weeklyActivity || []} 
              isLoading={isLoading} 
            />
          </div>
        </div>

        {/* Grammar Error Analysis - Full width */}
        <GrammarErrorChart 
          data={data?.grammarErrors || []} 
          isLoading={isLoading} 
        />

        {/* Motivational footer */}
        {isStreakActive && streak && streak.current_streak >= 7 && (
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 shadow rounded-2xl">
            <CardContent className="p-6 text-center">
              <p className="text-lg font-medium text-gray-900">
                🎉 Amazing! You've maintained a {streak.current_streak}-day streak! Keep it up!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
