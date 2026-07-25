'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Compass, Sparkles, BookOpen, User, Menu, X, Search, LayoutDashboard, LogOut } from 'lucide-react';
import { api } from '@/lib/api';

export default function Navbar({
  onOpenAIChat,
}: {
  onOpenAIChat?: (prompt?: string) => void;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('access_token');
      setIsLoggedIn(Boolean(token));
    }
  }, []);

  const handleLogout = () => {
    api.logout();
    setIsLoggedIn(false);
    router.push('/login');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchValue.trim()) return;

    const query = searchValue.trim();
    if (query.toLowerCase().includes('how') || query.toLowerCase().includes('want') || query.toLowerCase().includes('become') || query.toLowerCase().includes('course')) {
      if (onOpenAIChat) {
        onOpenAIChat(query);
      } else {
        router.push(`/courses?search=${encodeURIComponent(query)}`);
      }
    } else {
      router.push(`/courses?search=${encodeURIComponent(query)}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-slate-200/50 shadow-[0_4px_30px_rgb(0,0,0,0.03)] transition-all duration-300">
      
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-[#0d1527] via-[#10192e] to-slate-900 py-2 px-3 sm:px-4 text-center text-[11px] sm:text-xs text-slate-200 flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-300 to-amber-500 text-slate-950 text-[9px] sm:text-[10px] font-black flex items-center gap-1 shadow-sm uppercase tracking-wider shrink-0">
            <Sparkles className="w-3 h-3 text-slate-950" />
            <span>Capstone 2026</span>
          </span>
          <span className="sm:hidden font-bold text-amber-300">SkillPilot AI Platform</span>
        </div>
        <span className="leading-tight">
          🎓 <strong className="hidden sm:inline">SkillPilot AI Platform</strong> <span className="hidden sm:inline">-</span> Dynamic Gemini Career Counseling & Stripe Checkout
        </span>
        <button
          onClick={() => onOpenAIChat?.()}
          className="text-amber-300 hover:text-amber-200 underline font-bold text-[11px] shrink-0"
        >
          Try AI Advisor →
        </button>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group shrink-0">
            <div className="w-10 h-10 rounded-xl bg-amber-400 flex items-center justify-center shadow-sm">
              <Compass className="w-6 h-6 text-slate-950 font-bold" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-1.5">
                Skill<span className="text-indigo-600">Pilot</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 border border-indigo-200">AI 2.0</span>
              </span>
              <span className="text-[10px] text-slate-500 font-semibold tracking-wider">CAREER ENGINE</span>
            </div>
          </Link>

          {/* Center Interactive Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-2 lg:mx-4">
            <form onSubmit={handleSearchSubmit} className="relative w-full flex items-center">
              <button type="submit" className="absolute left-3.5 text-slate-400 hover:text-indigo-600 transition-colors">
                <Search className="w-4 h-4" />
              </button>
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search courses or ask AI (e.g. Python, Docker...)"
                className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-200/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white font-medium transition-all shadow-inner"
              />
            </form>
          </div>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-6 shrink-0">
            <Link href="/courses" className="text-xs font-bold text-slate-700 hover:text-indigo-600 transition-colors flex items-center gap-1">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>All Courses</span>
            </Link>
            
            <button
              onClick={() => onOpenAIChat?.()}
              className="text-xs font-bold text-indigo-700 hover:text-indigo-800 transition-colors flex items-center gap-1 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-lg"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>AI Career Advisor</span>
            </button>
          </div>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center space-x-3 shrink-0">
            {isLoggedIn ? (
              <div className="flex items-center space-x-2">
                <Link
                  href="/dashboard"
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-sm flex items-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                <button
                  onClick={handleLogout}
                  title="Log Out"
                  className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-all shadow-sm flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                <span>Sign In / Join</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3">
          {/* Mobile Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative w-full flex items-center mb-2">
            <button type="submit" className="absolute left-3 text-slate-400">
              <Search className="w-4 h-4" />
            </button>
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search courses..."
              className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
            />
          </form>

          <Link href="/courses" className="block py-2 text-sm font-bold text-slate-800">
            All Courses
          </Link>

          {isLoggedIn && (
            <Link href="/dashboard" className="block py-2 text-sm font-bold text-indigo-600">
              My Dashboard
            </Link>
          )}

          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              onOpenAIChat?.();
            }}
            className="w-full text-left py-2 text-sm font-bold text-indigo-600 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            AI Career Advisor
          </button>

          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="w-full py-3 rounded-xl text-center text-sm font-bold text-white bg-slate-900 block"
            >
              Log Out
            </button>
          ) : (
            <Link
              href="/login"
              className="w-full py-3 rounded-xl text-center text-sm font-bold text-slate-950 bg-amber-400 block"
            >
              Sign In / Join
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
