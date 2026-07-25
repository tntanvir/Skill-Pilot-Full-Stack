'use client';

import { Zap, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function TopPromoStrip() {
  return (
    <div className="bg-slate-100 border-b border-slate-200 py-3 text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-3">
          <span className="px-2.5 py-1 rounded-md bg-amber-400 text-slate-950 font-black flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 fill-slate-950" />
            <span>LIVE TRACKS</span>
          </span>
          <span className="font-bold text-slate-900">
            🎓 Admission is now open for Mobile App Dev, DevOps, Security & Artificial Intelligence
          </span>
        </div>

        <Link
          href="/courses"
          className="text-indigo-600 hover:text-indigo-800 font-extrabold flex items-center gap-1 hover:underline transition-colors shrink-0"
        >
          <span>View All Batches</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
