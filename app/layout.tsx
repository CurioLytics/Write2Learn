import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/stores/auth-store";
import { Toaster } from "sonner";
import { FloatingFeedbackButton } from "@/components/layout/floating-feedback-button";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Write2Learn - Improve Your English Writing',
  description: 'Master English writing through journaling, vocabulary building, and interactive roleplay.',
  icons: {
    icon: '/images/logo.png',
    shortcut: '/images/logo.png',
    apple: '/images/logo.png',
  },
};

// Force all pages to be dynamic to prevent prerendering errors
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${bricolage.variable} antialiased`}>
        <AuthProvider>
          {children}
          <Toaster />
          <FloatingFeedbackButton />
        </AuthProvider>
      </body>
    </html>
  );
}
