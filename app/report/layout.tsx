'use client';

import { AppLayout } from '@/components/layout/app-layout';

export default function ReportLayout({
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