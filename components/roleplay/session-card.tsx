'use client';

import { RoleplaySessionData } from '@/types/roleplay';
import { Pin } from 'lucide-react';

interface SessionCardProps {
  session: RoleplaySessionData;
  onClick: () => void;
  onTogglePin?: (sessionId: string, pinned: boolean) => void;
}

export function SessionCard({ session, onClick, onTogglePin }: SessionCardProps) {
  const handlePinClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when clicking pin
    if (onTogglePin) {
      onTogglePin(session.session_id, !session.pinned);
    }
  };

  return (
    <div
      onClick={onClick}
      className="p-3 rounded-md cursor-pointer hover:bg-gray-100 relative group"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-gray-800 truncate flex-1">
          {session.scenario_name}
        </p>

        {onTogglePin && (
          <button
            onClick={handlePinClick}
            className={`flex-shrink-0 p-1 rounded hover:bg-gray-200 transition-colors ${session.pinned ? 'text-blue-600' : 'text-gray-400'
              }`}
            title={session.pinned ? 'Bỏ ghim' : 'Ghim'}
          >
            <Pin
              className="h-4 w-4"
              fill={session.pinned ? 'currentColor' : 'none'}
            />
          </button>
        )}
      </div>
    </div>
  );
}
