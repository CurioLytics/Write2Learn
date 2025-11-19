'use client';

import { usePathname } from 'next/navigation';
import { AppLayout } from '@/components/layout/app-layout';

export default function FlashcardsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  
  // Only main flashcards page should have sidebar
  // Create flow should be focused (no sidebar)
  const shouldHaveSidebar = pathname === '/flashcards';
  
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