import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface ProgressCardProps {
  icon: LucideIcon;
  value: number;
  label: string;
  color: string;
  isLoading?: boolean;
  error?: string | null;
}

export function ProgressCard({
  icon: Icon,
  value,
  label,
  color,
  isLoading = false,
  error = null
}: ProgressCardProps) {
  return (
    <Card className="p-4 border border-gray-200 rounded-lg bg-white">
      <div className="flex flex-col items-center text-center gap-3">

        {/* Icon */}
        <div className={`${color}`}>
          <Icon className="w-8 h-8" strokeWidth={1.3} />
        </div>

        {/* Content */}
        <div className="space-y-1">
          {error ? (
            <>
              <div className="text-red-500 text-2xl leading-none">❌</div>
              <p className="text-red-600 text-xs">{error}</p>
            </>
          ) : isLoading ? (
            <>
              <div className="animate-pulse bg-gray-200 h-8 w-12 rounded mx-auto"></div>
              <div className="animate-pulse bg-gray-200 h-3 w-16 rounded mx-auto"></div>
            </>
          ) : (
            <>
              <div className="text-gray-900 text-2xl leading-none font-semibold">
                {value.toLocaleString()}
              </div>
              <p className="text-gray-600 text-sm">{label}</p>
            </>
          )}
        </div>

      </div>
    </Card>
  );
}
