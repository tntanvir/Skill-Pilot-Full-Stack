'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { User } from '@/types';
import {
  Compass,
  LayoutDashboard,
  BookOpen,
  Sparkles,
  CreditCard,
  Settings,
  Menu,
  X,
  LogOut,
  Users,
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const token = typeof window !== 'undefined' ? sessionStorage.getItem('access_token') : null;
      if (!token) {
        router.push('/login');
        return;
      }
      try {
        const profileData = await api.getProfile();
        setUser(profileData);
        setIsLoading(false);
      } catch (err) {
        console.warn('Authentication failed:', err);
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('refresh_token');
        router.push('/login');
      }
    }
    loadUser();
  }, [router]);

  if (isLoading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-slate-500">Loading Dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-900">
      {/* MOBILE TOP HEADER BAR */}
      <div className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center font-bold">
            <Compass className="w-5 h-5 text-slate-950" />
          </div>
          <span className="text-base font-black text-slate-900">
            Skill<span className="text-indigo-600">Pilot</span>
          </span>
        </Link>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* LEFT SIDEBAR DRAWER */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 w-64 bg-white border-r border-slate-200 h-screen flex flex-col justify-between p-5 transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          {/* Brand Logo */}
          <Link href="/" className="hidden md:flex items-center space-x-3 group pt-2">
            <div className="w-10 h-10 rounded-xl bg-amber-400 flex items-center justify-center shadow-sm">
              <Compass className="w-6 h-6 text-slate-950 font-bold" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-slate-900 flex items-center gap-1">
                Skill<span className="text-indigo-600">Pilot</span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-200">
                  AI 2.0
                </span>
              </span>
              <span className="text-[10px] text-slate-400 font-bold tracking-wider">
                {user?.role === 'mentor' ? 'MENTOR DASHBOARD' : 'LEARNER DASHBOARD'}
              </span>
            </div>
          </Link>

          {/* Vertical Navigation Menu */}
          <div className="space-y-1.5 pt-4">
            <span className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
              Main Menu
            </span>
            {[
              ...(user?.role === 'mentor' ? [
                { id: 'overview', href: '/dashboard', label: 'Mentor Analytics', icon: LayoutDashboard },
                { id: 'courses', href: '/dashboard/courses', label: 'Manage Courses', icon: BookOpen },
                { id: 'students', href: '/dashboard/students', label: 'My Students', icon: Users },
                { id: 'payments', href: '/dashboard/payments', label: 'Earnings', icon: CreditCard },
                { id: 'settings', href: '/dashboard/settings', label: 'Account Settings', icon: Settings },
              ] : [
                { id: 'overview', href: '/dashboard', label: 'Overview Analytics', icon: LayoutDashboard },
                { id: 'courses', href: '/dashboard/courses', label: 'My Enrolled Courses', icon: BookOpen },
                { id: 'ai-chat', href: '/dashboard/ai-chat', label: 'AI Skill Assistant', icon: Sparkles },
                { id: 'payments', href: '/dashboard/payments', label: 'Billing & Payments', icon: CreditCard },
                { id: 'settings', href: '/dashboard/settings', label: 'Account Settings', icon: Settings },
              ])
            ].map((tab) => {
              const Icon = tab.icon;
              // Overview is strictly `/dashboard`, so exact match for it, otherwise startsWith match for subroutes
              const isActive =
                tab.id === 'overview'
                  ? pathname === tab.href
                  : pathname.startsWith(tab.href);

              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`w-full p-3 rounded-2xl text-xs font-extrabold flex items-center gap-3 transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                  <span>{tab.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Bottom User Profile Snippet */}
        <div className="pt-4 border-t border-slate-200 space-y-3">
          <div className="flex items-center space-x-3 p-2.5 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-xs shrink-0">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="overflow-hidden flex-1">
              <h4 className="text-xs font-black text-slate-900 truncate">
                {user?.username || 'Learner'}
              </h4>
              <p className="text-[10px] text-slate-500 font-medium truncate">{user?.email || 'user@skillpilot.com'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="flex-1 py-2 text-center text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200"
            >
              Public Catalog
            </Link>
            <button
              onClick={() => {
                api.logout();
                window.location.href = '/login';
              }}
              title="Log Out"
              className="p-2 text-slate-600 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 rounded-xl border border-slate-200 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* RIGHT MAIN CONTENT AREA */}
      <main className="flex-1 p-6 sm:p-10 max-w-6xl w-full space-y-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
