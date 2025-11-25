import { cn } from '@/utils/ui';

interface BrandedTextProps {
  variant?: 'full' | 'short';
  className?: string;
}

/**
 * Branded text component for Write2Learn / W2L
 * Colors: W(black), 2(black-top/blue-bottom gradient), L(blue)
 */
export function BrandedText({ variant = 'full', className }: BrandedTextProps) {
  if (variant === 'short') {
    return (
      <span className={cn('font-semibold', className)}>
        <span className="text-black">W</span>
        <span className="bg-gradient-to-b from-black from-50% to-blue-600 to-50% bg-clip-text text-transparent">2</span>
        <span className="text-blue-600">L</span>
      </span>
    );
  }

  return (
    <span className={cn('font-semibold', className)}>
      <span className="text-black">Write</span>
      <span className="bg-gradient-to-b from-black from-50% to-blue-600 to-50% bg-clip-text text-transparent">2</span>
      <span className="text-blue-600">Learn</span>
    </span>
  );
}
