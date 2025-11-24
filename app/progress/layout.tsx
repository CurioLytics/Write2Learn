'use client';

import { AppLayout } from '@/components/layout/app-layout';

export default function ProgressLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppLayout>
      <div className="english-theme">
        {children}
      </div>
    </AppLayout>
  );
}
