'use client';

import { RoleplaySessionData } from '@/types/roleplay';

interface SessionCardProps {
  session: RoleplaySessionData;
  onClick: () => void;
}

export function SessionCard({ session, onClick }: SessionCardProps) {
  return (
    <div
      onClick={onClick}
      className="p-3 rounded-md cursor-pointer hover:bg-gray-100"
    >
      <p className="text-sm text-gray-800 truncate">
        {session.scenario_name}
      </p>
    </div>
  );
}
