'use client';

import { AppLayout } from '@/components/layout/app-layout';

export default function FeedbackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppLayout>
      {children}
    </AppLayout>
  );
}