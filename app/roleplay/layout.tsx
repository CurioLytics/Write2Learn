'use client';

import { usePathname } from 'next/navigation';
import { AppLayout } from '@/components/layout/app-layout';

export default function RoleplayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Only main roleplay page should have sidebar
  // Sessions should be focused (no sidebar)
  const shouldHaveSidebar = pathname === '/roleplay';
  
  if (!shouldHaveSidebar) {
    return (
      <div className="min-h-screen bg-white english-theme">
        {children}
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="english-theme">
        {children}
      </div>
    </AppLayout>
  );
}