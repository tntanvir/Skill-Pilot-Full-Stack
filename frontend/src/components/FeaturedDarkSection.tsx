'use client';

import { Course } from '@/types';
import CourseCard from './CourseCard';
import Link from 'next/link';
import { ArrowRight, Flame } from 'lucide-react';

export default function FeaturedDarkSection({ courses, loading }: { courses: Course[]; loading?: boolean }) {
  return (
    <section className="py-24 bg-[#0a0f1c] relative overflow-hidden">
      {/* Dark Section Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-black text-amber-400 uppercase tracking-[0.2em] flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>TRENDING SKILL PATHWAYS</span>
            </span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-black text-white">
              Featured & Highly Rated <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">Courses</span>
            </h2>
          </div>
          <Link
            href="/courses"
            className="text-xs font-black text-indigo-300 hover:text-indigo-100 flex items-center gap-1 transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl border border-white/10"
          >
            <span>View All Courses</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-96 rounded-2xl bg-slate-200 border border-slate-300" />
            ))}
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses.slice(0, 8).map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black transition-all shadow-[0_4px_14px_rgba(79,70,229,0.3)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.4)]"
          >
            <span>See Full Database Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}
