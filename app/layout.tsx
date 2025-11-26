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
  title: "Write2Learn",
  description: "Write your Thoughts, Learn your Words",
  icons: {
    icon: '/images/logo.svg',
    shortcut: '/images/logo.svg',
    apple: '/images/logo.svg',
  },
};

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
