'use client';

import { RoleplaySessionData } from '@/services/roleplay-session-service';

interface SessionCardProps {
  session: RoleplaySessionData;
  onClick: () => void;
}

export function SessionCard({ session, onClick }: SessionCardProps) {
  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <h3 className="font-medium text-gray-900 truncate">
        {session.scenario_name}
      </h3>
    </div>
  );
}