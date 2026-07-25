import './globals.css';
import type { Metadata } from 'next';
import AppShell from '@/components/AppShell';
import { Dancing_Script } from 'next/font/google';
import { Toaster } from 'react-hot-toast';

const dancingScript = Dancing_Script({ 
  subsets: ['latin'],
  variable: '--font-dancing-script',
});

export const metadata: Metadata = {
  title: 'SkillPilot - Smart E-Learning & AI Career Advisor',
  description: 'Next-generation online learning platform powered by Django REST Framework, Google Gemini AI, and Stripe API.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`light scroll-smooth ${dancingScript.variable}`} suppressHydrationWarning>
      <body
        className="bg-[#ffffff] text-slate-900 min-h-screen flex flex-col selection:bg-amber-400 selection:text-slate-950 font-sans"
        suppressHydrationWarning
      >
        <AppShell>{children}</AppShell>
        <Toaster position="bottom-right" reverseOrder={false} />
      </body>
    </html>
  );
}
