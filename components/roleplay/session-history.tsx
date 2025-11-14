'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/auth/use-auth';
import { roleplaySessionService, RoleplaySessionData } from '@/services/roleplay-session-service';
import { SessionCard } from './session-card';
import { SessionDetailDialog } from './session-detail-dialog';
import { History } from 'lucide-react';

export function SessionHistory() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<RoleplaySessionData[]>([]);
  const [selectedSession, setSelectedSession] = useState<RoleplaySessionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSessions() {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const data = await roleplaySessionService.getSessions(user.id);
        setSessions(data);
      } catch (err) {
        console.error('Error fetching sessions:', err);
        setSessions([]);
      } finally {
        setLoading(false);
      }
    }

    fetchSessions();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <History className="h-5 w-5 text-gray-600" />
          <h2 className="text-xl font-semibold text-gray-900">Session History</h2>
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <History className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Chưa có phiên hội thoại nào được hoàn thành</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessions.map((session) => (
              <SessionCard
                key={session.session_id}
                session={session}
                onClick={() => setSelectedSession(session)}
              />
            ))}
          </div>
        )}
      </div>

      <SessionDetailDialog
        session={selectedSession}
        onClose={() => setSelectedSession(null)}
      />
    </>
  );
}