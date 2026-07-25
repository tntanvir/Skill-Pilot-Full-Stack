'use client';

import { useState } from 'react';
import { Sparkles, ArrowRight, Play, CheckCircle2, Users } from 'lucide-react';
import Link from 'next/link';
import { Course } from '@/types';

export default function Hero({ onSearchSubmit, latestCourse }: { onSearchSubmit: (prompt: string) => void, latestCourse?: Course }) {
  const [inputQuery, setInputQuery] = useState('');

  return (
    <section className="relative pt-8 pb-16 md:pt-14 md:pb-24 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Hero Copy & CTA */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Top Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-xs font-bold text-amber-900">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>SkillPilot AI Platform • University Capstone</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-tight tracking-tight">
              Empower Your Future with <br className="hidden sm:inline" />
              <span className="text-indigo-600 underline decoration-amber-400 decoration-wavy underline-offset-8">
                SkillPilot AI
              </span>
            </h1>

            {/* Subtext */}
            <p className="text-sm sm:text-base text-slate-600 max-w-xl leading-relaxed font-medium">
              Tell our AI counselor your current skills and target job. SkillPilot dynamically scans our database to match you with top-tier technical courses, live mentorship, and real-world project portfolios.
            </p>

            {/* Primary Action Row */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link
                href="/courses"
                className="px-6 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-sm transition-transform hover:scale-105"
              >
                <span>Browse All Courses</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                onClick={() => onSearchSubmit('I know Python and basic HTML. My goal is to become a Backend Developer.')}
                className="px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-900 font-bold text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Ask AI Advisor</span>
              </button>
            </div>

            {/* Feature Bullets */}
            <div className="pt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-bold text-slate-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Live Interactive Track</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Real Industry Projects</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Stripe Checkout Security</span>
              </div>
            </div>

            {/* Mini Stats Bar */}
            <div className="pt-4 border-t border-slate-200 flex items-center space-x-8 text-slate-600 text-xs font-semibold">
              <div>
                <span className="text-lg font-black text-slate-900 block">15,000+</span>
                <span>Active Learners</span>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div>
                <span className="text-lg font-black text-indigo-600 block">13+</span>
                <span>Verified Courses</span>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div>
                <span className="text-lg font-black text-emerald-600 block">99.4%</span>
                <span>AI Accuracy Rate</span>
              </div>
            </div>

          </div>

          {/* Right Column: Hero Media Card */}
          <div className="lg:col-span-5 relative">
            {/* Decorative Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-indigo-500 rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000" />
            
            <div className="bg-slate-900 rounded-3xl p-2.5 sm:p-3 border border-slate-800 shadow-2xl relative group overflow-hidden ring-1 ring-white/10">
              
              {/* Image Container */}
              <div className="relative h-[320px] sm:h-[380px] w-full rounded-2xl bg-[#0a0f1c] overflow-hidden flex items-center justify-center">
                
                {/* Background Tech Aesthetic or Thumbnail */}
                {latestCourse?.thumbnail ? (
                  <img 
                    src={latestCourse.thumbnail} 
                    alt={latestCourse.title} 
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 via-[#10192e] to-indigo-950/60" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent transition-opacity duration-500" />
                
                {/* Decorative Tag */}
                <div className="absolute top-4 left-4 z-10">
                  <span className="px-3 py-1.5 rounded-full text-[10px] font-black bg-white/10 backdrop-blur-md text-white shadow-sm border border-white/20 tracking-widest uppercase">
                    🔥 Featured Masterclass
                  </span>
                </div>

                {/* Glassmorphic Play Button */}
                <div className="relative z-10 w-16 h-16 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.4)] group-hover:bg-amber-400 group-hover:border-amber-300 group-hover:text-slate-950 group-hover:scale-110 transition-all duration-500 cursor-pointer overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/20 rounded-full" />
                  <Play className="w-6 h-6 ml-1 drop-shadow-md" strokeWidth={2.5} />
                </div>

                {/* Bottom Banner Title Overlay inside Card */}
                <div className="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent z-10">
                  <span className="text-[10px] font-black text-amber-400 uppercase tracking-[0.2em] block mb-2 opacity-90">
                    {latestCourse ? (typeof latestCourse.category === 'object' ? latestCourse.category.name : latestCourse.category_name) : 'MASTERCLASS 2026'}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white leading-tight drop-shadow-lg">
                    {latestCourse?.title || 'AI, Cyber Security & Full Stack Software Engineering'}
                  </h3>
                </div>

              </div>

              {/* Sub-strip info below image */}
              <div className="mt-2 px-3 pb-2 pt-3 flex items-center justify-between text-xs font-medium text-slate-400">
                <div className="flex items-center space-x-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className={`w-6 h-6 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center overflow-hidden z-[${4-i}]`}>
                        <Users className="w-3 h-3 text-slate-400" />
                      </div>
                    ))}
                  </div>
                  <span className="pl-2 tracking-wide">
                    <strong className="text-slate-200">{latestCourse ? `${latestCourse.id * 123}+` : '2,480+'}</strong> enrolled
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                  {latestCourse ? (latestCourse.level.charAt(0).toUpperCase() + latestCourse.level.slice(1)) : 'Live & Recorded'}
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
