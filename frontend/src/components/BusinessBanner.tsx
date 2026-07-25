'use client';

import { Building2, ArrowRight, CheckCircle2, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function BusinessBanner() {
  return (
    <section className="py-16 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-8 sm:p-12 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8 shadow-sm">
          
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-extrabold border border-emerald-300">
              <Building2 className="w-4 h-4 text-emerald-700" />
              <span>SkillPilot for Universities & Teams</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 leading-tight">
              Upskill Your Academic Department or Engineering Team
            </h2>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              Empower your students and developers with custom learning paths, AI progress tracking, mentor analytics, and enterprise Stripe billing.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-800 font-bold">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Bulk Student Licenses</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Custom Gemini AI Guidance</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Mentor Analytics Suite</span>
              </div>
            </div>

            <div className="pt-4 flex items-center gap-3">
              <Link
                href="/courses"
                className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-transform hover:scale-105 shadow-md flex items-center gap-2"
              >
                <span>Request Enterprise Access</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Graphic Element */}
          <div className="w-full lg:w-96 bg-white p-6 rounded-2xl border border-emerald-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Department Growth</span>
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" /> +148% Completion
              </span>
            </div>
            
            <div className="h-32 bg-slate-50 rounded-xl p-4 flex items-end justify-between gap-2 border border-slate-200">
              <div className="w-full bg-emerald-200 rounded-t-md h-12" />
              <div className="w-full bg-emerald-300 rounded-t-md h-20" />
              <div className="w-full bg-emerald-400 rounded-t-md h-16" />
              <div className="w-full bg-emerald-600 rounded-t-md h-28" />
            </div>

            <p className="text-[11px] text-slate-500 text-center font-medium">
              Real-time skill acquisition metrics powered by SkillPilot Engine
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}
