'use client';

import { Users, BookOpen, Sparkles, ShieldCheck } from 'lucide-react';

export default function StatCards() {
  const stats = [
    {
      label: 'Enrolled Learners',
      value: '15,000+',
      color: 'bg-emerald-50 text-emerald-950 border-emerald-200',
      icon: Users,
    },
    {
      label: 'Verified Courses',
      value: '13+ Tracks',
      color: 'bg-indigo-50 text-indigo-950 border-indigo-200',
      icon: BookOpen,
    },
    {
      label: 'AI Recommendation Match',
      value: '99.4%',
      color: 'bg-amber-50 text-amber-950 border-amber-200',
      icon: Sparkles,
    },
    {
      label: 'Verified Certificates',
      value: '100% Validated',
      color: 'bg-cyan-50 text-cyan-950 border-cyan-200',
      icon: ShieldCheck,
    },
  ];

  return (
    <section className="py-14 bg-[#f8fafc] border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className={`p-6 rounded-2xl border ${item.color} shadow-sm`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600">{item.label}</span>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="mt-3 text-3xl font-black text-slate-900">{item.value}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
