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

export function ProgressCard({ icon: Icon, value, label, color, isLoading = false, error = null }: ProgressCardProps) {
  return (
    <Card className="p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer border border-gray-200 rounded-lg bg-white">
      <div className="flex flex-col items-center text-center gap-4">
        <div className={`${color}`}>
          <Icon className="w-12 h-12" strokeWidth={1.5} />
        </div>
        <div>
          {error ? (
            <>
              <div className="text-red-500 mb-2" style={{ fontSize: '2.5rem', lineHeight: '1.2' }}>
                ❌
              </div>
              <p className="text-red-600 text-sm">{error}</p>
            </>
          ) : isLoading ? (
            <>
              <div className="animate-pulse bg-gray-200 h-12 w-16 rounded mx-auto mb-2"></div>
              <div className="animate-pulse bg-gray-200 h-4 w-24 rounded mx-auto"></div>
            </>
          ) : (
            <>
              <div className="text-gray-900 mb-2" style={{ fontSize: '2.5rem', lineHeight: '1.2' }}>
                {value.toLocaleString()}
              </div>
              <p className="text-gray-600">{label}</p>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
