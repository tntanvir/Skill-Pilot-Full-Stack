'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AIChatWidget from '@/components/AIChatWidget';
import { Sparkles } from 'lucide-react';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  useEffect(() => {
    const handleOpenChat = () => setIsAIChatOpen(true);
    window.addEventListener('open-ai-chat', handleOpenChat);
    return () => window.removeEventListener('open-ai-chat', handleOpenChat);
  }, []);

  // Pages where Navbar & Footer are hidden
  const hideHeaderFooter = ['/dashboard', '/login', '/register'].some(
    (path) => pathname === path || pathname?.startsWith('/dashboard/')
  );

  if (hideHeaderFooter) {
    return <main className="flex-1 flex flex-col">{children}</main>;
  }

  return (
    <>
      <Navbar onOpenAIChat={() => setIsAIChatOpen(true)} />
      <main className="flex-1 flex flex-col">{children}</main>
      <Footer />
      
      {/* Floating AI Chatbot Button (Global) */}
      <button
        onClick={() => setIsAIChatOpen(true)}
        className="fixed bottom-6 right-6 z-40 p-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 flex items-center gap-2 font-black text-xs"
        title="Open SkillPilot AI Advisor"
      >
        <Sparkles className="w-5 h-5 text-slate-950" />
        <span className="hidden sm:inline-block">Ask AI Counselor</span>
      </button>

      {/* Interactive AI Chatbot Widget (Global) */}
      <AIChatWidget isOpen={isAIChatOpen} onClose={() => setIsAIChatOpen(false)} />
    </>
  );
}
