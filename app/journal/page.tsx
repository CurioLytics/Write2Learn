'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { JournalList, CalendarView } from '@/components/features/journal/entries';
import { JournalStatsDisplay } from '@/components/features/journal/stats';
import { WakeUpCall } from '@/components/features/journal/motivation';
import { TemplateCards } from '@/components/journal/template-cards';
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
  const [showTemplates, setShowTemplates] = useState(false);
  
  const templateSectionRef = useRef<HTMLDivElement>(null);

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

  const handleShowTemplates = () => {
    setShowTemplates(true);
    // Scroll to template section
    if (templateSectionRef.current) {
      templateSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const renderEmptyState = () => (
    <div className="space-y-8">
      {/* Empty state message */}
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <div className="mb-4"></div>
        <h2 className="text-xl font-medium text-gray-800 mb-3">Start Your Journal Journey</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Keep track of your language learning progress by writing daily journal entries.
        </p>
        <Button 
          onClick={() => router.push('/journal/new')}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Your First Entry
        </Button>
      </div>
      
      {/* Template cards for new users */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Or Choose a Template</h2>
        <TemplateCards />
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 space-y-8 py-8">
      <div className="bg-white shadow rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Your Journal</h1>
            <p className="mt-2 text-sm text-gray-600">
              Ghi lại hành trình học tiếng Anh của bạn
            </p>
          </div>
          
          <Button 
            onClick={() => router.push('/journal/new')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            New Entry
          </Button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
            <button 
              onClick={() => window.location.reload()} 
              className="ml-2 underline"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column - Journal list */}
            <div className="lg:col-span-2">
              {journals.length === 0 ? renderEmptyState() : (
                <>
                  <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <h2 className="text-lg font-medium text-gray-800 mb-4">Your Journal Entries</h2>
                    <JournalList 
                      journals={journals}
                      onSelect={handleJournalSelect}
                      selectedJournalId={selectedJournal?.id}
                    />
                  </div>
                  
                  {/* Wake up call section */}
                  {!showTemplates && (
                    <WakeUpCall onShowTemplates={handleShowTemplates} />
                  )}
                  
                  {/* Template section */}
                  {showTemplates && (
                    <div ref={templateSectionRef} className="mt-8">
                      <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-medium text-gray-800 mb-4">Choose a Template</h2>
                        <TemplateCards />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            
            {/* Right column - Stats and calendar */}
            <div>
              {/* Stats panel */}
              <div className="mb-6">
                <JournalStatsDisplay stats={stats} isLoading={isLoading} />
              </div>
              
              {/* Calendar panel */}
              <CalendarView 
                journals={journals}
                onDateSelect={handleDateSelect}
                selectedDate={selectedDate}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}