'use client';

import { useState } from 'react';
import { Course } from '@/types';
import CourseCard from './CourseCard';
import { Smartphone, Cloud, Shield, Brain, Server, Sparkles } from 'lucide-react';

export default function CategoryTabs({ courses, loading }: { courses: Course[]; loading?: boolean }) {
  const [activeTab, setActiveTab] = useState('All');

  const tabs = [
    { label: 'All Tracks', category: 'All', icon: Sparkles },
    { label: 'Mobile App Dev', category: 'Mobile App Development', icon: Smartphone },
    { label: 'DevOps & Cloud', category: 'DevOps & Cloud', icon: Cloud },
    { label: 'Cyber Security', category: 'Networking & Security', icon: Shield },
    { label: 'AI & Data Science', category: 'Artificial Intelligence', icon: Brain },
    { label: 'Backend APIs', category: 'Backend Development', icon: Server },
  ];

  const filteredCourses = activeTab === 'All'
    ? courses
    : courses.filter((c) => {
        const catName = typeof c.category === 'object' && c.category?.name ? c.category.name : (c.category_name || '');
        return catName.toLowerCase().includes(activeTab.toLowerCase());
      });

  return (
    <section className="py-20 bg-slate-50 border-b border-slate-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">
            ONLINE LIVE TRACKS
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-black text-slate-900">
            Explore Career Tracks & <span className="text-amber-500">Live Batches</span>
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 font-medium">
            Choose your domain to view current live batches, project curriculums, and enrollment details.
          </p>
        </div>

        {/* Tab Selector Buttons */}
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.category;
            return (
              <button
                key={tab.category}
                onClick={() => setActiveTab(tab.category)}
                className={`px-5 py-3 rounded-2xl text-xs font-black transition-all duration-300 flex items-center gap-2 ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-[0_4px_12px_rgba(0,0,0,0.1)] scale-105 ring-4 ring-slate-900/10'
                    : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 hover:shadow-sm'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Course Grid */}
        {loading ? (
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-96 rounded-2xl bg-slate-200 border border-slate-300" />
            ))}
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.slice(0, 6).map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
