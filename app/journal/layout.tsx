'use client';

import { usePathname } from 'next/navigation';
import { AppLayout } from '@/components/layout/app-layout';

export default function JournalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Only the main journal page should have sidebar
  // Writing, editing, and feedback pages should be focused
  const shouldHaveSidebar = pathname === '/journal' || pathname === '/journal/templates';
  
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