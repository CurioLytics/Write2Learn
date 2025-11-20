'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Search } from 'lucide-react';
import { JournalList, CalendarView } from '@/components/features/journal/entries';
import { JournalStatsDisplay } from '@/components/features/journal/stats';
import { ExploreFrameworks } from '@/components/journal/explore-frameworks';
import { TagFilter } from '@/components/journal/tag-filter';
import { Journal, JournalStats } from '@/types/journal';
import { journalService } from '@/services/journal-service';
import { useAuth } from '@/hooks/auth/use-auth';

export default function JournalPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [journals, setJournals] = useState<Journal[]>([]);
  const [stats, setStats] = useState<JournalStats>({ total_journals: 0, current_streak: 0 });
  const [selectedJournal, setSelectedJournal] = useState<Journal | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Filter journals based on search query only
  const filteredJournals = useMemo(() => {
    return journals.filter(journal => {
      const matchesSearch = !searchQuery || 
        journal.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        journal.content.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesSearch;
    });
  }, [journals, searchQuery]);

  const handleTagFilterChange = async (tag: string | null) => {
    setSelectedTag(tag);
    
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const journalsData = tag 
        ? await journalService.getJournalsByTag(user.id, tag)
        : await journalService.getJournals(user.id);
      
      setJournals(journalsData);
    } catch (err) {
      console.error('Error fetching filtered journals:', err);
      setError('Failed to filter journals. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    async function fetchJournalData() {
      if (!user?.id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch journals and stats in parallel
        const [journalsData, statsData] = await Promise.all([
          journalService.getJournals(user.id),
          journalService.getJournalStats(user.id)
        ]);
        
        setJournals(journalsData);
        setStats(statsData);
      } catch (err) {
        console.error('Error fetching journal data:', err);
        setError('Failed to load journal data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchJournalData();
  }, [user?.id]);

  const handleJournalSelect = (journal: Journal) => {
    setSelectedJournal(journal);
    // Navigate to the journal entry
    router.push(`/journal/${journal.id}`);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    // Filter journals by the selected date
    const journalsForDate = journals.filter(journal => {
      const journalDate = new Date(journal.journal_date);
      return (
        journalDate.getDate() === date.getDate() &&
        journalDate.getMonth() === date.getMonth() &&
        journalDate.getFullYear() === date.getFullYear()
      );
    });
    
    // If journals exist for this date, select the first one
    if (journalsForDate.length > 0) {
      handleJournalSelect(journalsForDate[0]);
    } else {
      // If no journals for this date, create a new entry for this date
      router.push(`/journal/new?date=${date.toISOString().split('T')[0]}`);
    }
  };

return (
  <div className="flex flex-col items-center px-4 py-10 w-full">

    {/* HEADER */}
    <div className="w-full max-w-3xl bg-white shadow rounded-2xl p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Nhật ký của tôi</h1>
      <p className="mt-2 text-sm text-gray-600">
        Không gian viết lách, học hỏi và phát triển của bạn
      </p>
    </div>

    {/* Add spacing between header and next block */}
    <div className="w-full max-w-3xl space-y-6 mt-10">
      {/* Top Action Button */}
  <div className="flex justify-end">
    <Button onClick={() => router.push('/journal/new')} variant="default">
      Thêm mới
    </Button>
  </div>

      {/* Search and Filter */}
      <div className="space-y-4">

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Tìm kiếm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <TagFilter 
          onFilterChange={handleTagFilterChange}
          currentTag={selectedTag}
        />
      </div>

      {/* Journal & Calendar Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Journal List */}
        <div className="bg-gray-50 rounded-xl p-4 flex flex-col h-full">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Bài viết gần đây</h2>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 p-4 rounded-lg text-red-700 text-center">
              {error}
              <Button variant="link" onClick={() => window.location.reload()} className="ml-2">
                Thử lại
              </Button>
            </div>
          ) : filteredJournals.length === 0 ? (
            <div className="text-center text-gray-600 py-8 bg-gray-100 rounded-lg border border-dashed border-gray-300"> 
              <Button onClick={() => router.push('/journal/new')} variant="outline">
  
                <PlusCircle className="mr-2 h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              <JournalList 
                journals={filteredJournals}
                onSelect={handleJournalSelect}
                selectedJournalId={selectedJournal?.id}
              />
            </div>
          )}
        </div>

        {/* Calendar */}
        <div className="bg-gray-50 rounded-xl p-4 flex flex-col h-full">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Lịch</h3>
          <CalendarView 
            journals={journals}
            onDateSelect={handleDateSelect}
            selectedDate={selectedDate}
          />
        </div>
      </div>

    </div>

    {/* Framework Section */}
    <div className="w-full max-w-3xl mt-10 bg-white shadow rounded-2xl p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 text-center">Khám phá Framework</h2>
      <p className="text-center text-gray-600 mb-6">Khám phá các framework để trải nghiệm nhiều khía cạnh trong nhật k</p>
      <ExploreFrameworks />
    </div>

  </div>
);
}
