'use client';

import { useState, useEffect, useCallback } from 'react';
import { DashboardService } from '@/services/dashboard/dashboard-service';
import {
  DashboardStats,
  ErrorAnalysis,
  DashboardLoadingState,
  DashboardErrorState,
  DashboardData,
  DatePreset,
  ErrorAnalysisFilters
} from '@/types/dashboard';
import { getDateRangeFromPreset } from '@/utils/date-utils';

export function useDashboardData(profileId: string | null) {
  const [data, setData] = useState<Partial<DashboardData>>({});
  
  const [loading, setLoading] = useState<DashboardLoadingState>({
    stats: true,
    errorAnalysis: true
  });

  const [errors, setErrors] = useState<DashboardErrorState>({
    stats: null,
    errorAnalysis: null
  });

  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Date filter state with default to "this week"
  const [datePreset, setDatePreset] = useState<DatePreset>('this-week');
  const [errorAnalysisFilters, setErrorAnalysisFilters] = useState<ErrorAnalysisFilters>(() => ({
    dateRange: getDateRangeFromPreset('this-week'),
    preset: 'this-week'
  }));

  // Helper function to update loading state
  const updateLoading = useCallback((key: keyof DashboardLoadingState, value: boolean) => {
    setLoading(prev => ({ ...prev, [key]: value }));
  }, []);

  // Helper function to update error state
  const updateError = useCallback((key: keyof DashboardErrorState, value: string | null) => {
    setErrors(prev => ({ ...prev, [key]: value }));
  }, []);

  // Fetch dashboard stats
  const fetchStats = useCallback(async () => {
    if (!profileId) return;

    try {
      updateLoading('stats', true);
      updateError('stats', null);

      const stats = await DashboardService.getDashboardStats(profileId);
      setData(prev => ({ ...prev, stats }));
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định khi tải thống kê';
      updateError('stats', errorMessage);
      // KHÔNG set fallback data - để component hiển thị lỗi
    } finally {
      updateLoading('stats', false);
    }
  }, [profileId, updateLoading, updateError]);

  // Fetch error analysis with filters
  const fetchErrorAnalysis = useCallback(async (filters?: ErrorAnalysisFilters) => {
    if (!profileId) return;

    try {
      updateLoading('errorAnalysis', true);
      updateError('errorAnalysis', null);

      const filtersToUse = filters || errorAnalysisFilters;
      const errorAnalysis = await DashboardService.getErrorAnalysis(profileId, filtersToUse);
      setData(prev => ({ ...prev, errorAnalysis }));
    } catch (error) {
      console.error('Error fetching error analysis:', error);
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định khi tải phân tích lỗi';
      updateError('errorAnalysis', errorMessage);
      // KHÔNG set fallback data - để component hiển thị lỗi thực tế
    } finally {
      updateLoading('errorAnalysis', false);
    }
  }, [profileId, errorAnalysisFilters, updateLoading, updateError]);

  // Update date filter
  const updateDateFilter = useCallback((preset: DatePreset) => {
    const dateRange = getDateRangeFromPreset(preset);
    const newFilters: ErrorAnalysisFilters = {
      dateRange,
      preset
    };
    
    setDatePreset(preset);
    setErrorAnalysisFilters(newFilters);
    
    // Immediately fetch error analysis with new filters
    fetchErrorAnalysis(newFilters);
  }, [fetchErrorAnalysis]);

  // Refresh all data
  const refreshData = useCallback(async () => {
    if (!profileId) return;

    setLastUpdate(new Date());
    await Promise.all([
      fetchStats(),
      fetchErrorAnalysis()
    ]);
  }, [profileId, fetchStats, fetchErrorAnalysis]);

  // Initial data fetch
  useEffect(() => {
    if (profileId) {
      refreshData();
    }
  }, [profileId, refreshData]);

  // Check if all data is loaded
  const isLoading = Object.values(loading).some(Boolean);
  const hasErrors = Object.values(errors).some(Boolean);

  return {
    // Data
    stats: data.stats || null,
    errorAnalysis: data.errorAnalysis || null,
    
    // States
    loading,
    errors,
    isLoading,
    hasErrors,
    lastUpdate,

    // Date filter state
    datePreset,
    errorAnalysisFilters,

    // Actions
    refreshData,
    fetchStats,
    fetchErrorAnalysis,
    updateDateFilter
  };
}