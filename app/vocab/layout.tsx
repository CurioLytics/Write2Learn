'use client';

import { usePathname } from 'next/navigation';
import { AppLayout } from '@/components/layout/app-layout';

export default function VocabLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Only main vocab pages should have sidebar
  // Review sessions should be focused (no sidebar)
  const shouldHaveSidebar = !pathname.includes('/review');
  
  if (!shouldHaveSidebar) {
    return (
      <div className="min-h-screen bg-white">
        {children}
      </div>
    );
  }

  return (
    <AppLayout>
      {children}
    </AppLayout>
  );
}