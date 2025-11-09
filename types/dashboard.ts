import { Tables } from '@/types/database.types';

// Date filter types
export interface DateRange {
  from: string; // ISO date string  
  to: string;   // ISO date string
}

export type DatePreset = 'this-week' | '7-days' | '30-days' | '3-months' | 'all-time';

export interface ErrorAnalysisFilters {
  dateRange: DateRange | null;
  preset: DatePreset;
}

// Dashboard specific types
export interface DashboardStats {
  totalWordsLearned: number;
  totalJournalsCompleted: number;
  streakDays: number;
}

// Updated ErrorAnalysis to match service output
export interface ErrorAnalysis {
  id: string;
  category: string;
  description: string;
  frequency: number;
  detectedAt: string;
  topicName: string;
}

export interface DashboardData {
  stats: DashboardStats;
  errorAnalysis: ErrorAnalysis[];
  profile: UserProfile | null;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  level: string;
}

// Progress Card data
export interface ProgressCardData {
  id: number;
  icon: any; // Lucide icon component
  value: number;
  label: string;
  color: string;
}

// Loading states
export interface DashboardLoadingState {
  stats: boolean;
  errorAnalysis: boolean;
  profile: boolean;
}

// Error states
export interface DashboardErrorState {
  stats: string | null;
  errorAnalysis: string | null;
  profile: string | null;
}