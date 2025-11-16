'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Search } from 'lucide-react';
import { JournalList, CalendarView } from '@/components/features/journal/entries';
import { JournalStatsDisplay } from '@/components/features/journal/stats';
import { TemplateCards } from '@/components/journal/template-cards';
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
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Compact Header - Center aligned like home */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Journal Hub</h1>
        <p className="text-gray-600 mb-6">
          Your central space for writing, learning, and growing
        </p>
        
        <Button 
          onClick={() => router.push('/journal/new')}
          className="bg-blue-600 hover:bg-blue-700 mb-6"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          New Entry
        </Button>
        
        {/* Compact Filter Section */}
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Tag Filter Component */}
          <TagFilter 
            onFilterChange={handleTagFilterChange}
            currentTag={selectedTag}
          />
        </div>
      </div>

      {/* Single Column Layout like home */}
      <div className="space-y-8">
        {/* Templates Section - Like home */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-semibold text-center mb-4 text-gray-800">Your Templates</h2>
          <p className="text-center text-gray-600 mb-6">Click and drag to create entries or customize templates</p>
          <TemplateCards />
        </div>

        {/* Stats and Calendar - Horizontal layout */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          <JournalStatsDisplay stats={stats} isLoading={isLoading} />
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 text-center">Calendar</h3>
            <CalendarView 
              journals={journals}
              onDateSelect={handleDateSelect}
              selectedDate={selectedDate}
            />
          </div>
        </div>

        {/* Journal Entries - Compact */}
        <div className="max-w-4xl mx-auto bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 text-center">Recent Entries</h2>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-center">
              {error}
              <button onClick={() => window.location.reload()} className="ml-2 underline">
                Retry
              </button>
            </div>
          ) : filteredJournals.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <h3 className="text-lg font-medium text-gray-800 mb-3">
                {journals.length === 0 ? "Start Your Journal Journey" : "No entries found"}
              </h3>
              <p className="text-gray-600 mb-4">
                {journals.length === 0 
                  ? "Keep track of your language learning progress."
                  : "Try adjusting your search criteria."
                }
              </p>
              <Button onClick={() => router.push('/journal/new')} className="bg-blue-600 hover:bg-blue-700">
                <PlusCircle className="mr-2 h-4 w-4" />
                {journals.length === 0 ? "Create Your First Entry" : "New Entry"}
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

        {/* Explore Frameworks - Compact */}
        <div className="max-w-4xl mx-auto bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 text-center">Explore Frameworks</h2>
          <p className="text-center text-gray-600 mb-6">Discover structured approaches to enhance your journaling</p>
          <ExploreFrameworks />
        </div>
      </div>
    </div>
  );
}