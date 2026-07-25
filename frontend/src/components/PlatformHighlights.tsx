'use client';

import { Video, UserCheck, Award, Sparkles, FolderCode, Briefcase } from 'lucide-react';

export default function PlatformHighlights() {
  const highlights = [
    {
      icon: Video,
      title: 'Interactive HLS Stream',
      desc: 'Adaptive multi-resolution lesson player with Google Drive video stream integration.',
      bgColor: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    },
    {
      icon: UserCheck,
      title: 'Senior Technical Mentors',
      desc: 'Learn directly from industry software engineers with real-world experience.',
      bgColor: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    },
    {
      icon: Award,
      title: 'Verified Certification',
      desc: 'Earn university and industry-recognized skill badges upon course completion.',
      bgColor: 'bg-amber-50 text-amber-600 border-amber-200',
    },
    {
      icon: Sparkles,
      title: '24/7 AI Skill Advisor',
      desc: 'Ask Google Gemini AI to analyze your current background and map your target career path.',
      bgColor: 'bg-cyan-50 text-cyan-600 border-cyan-200',
    },
    {
      icon: FolderCode,
      title: 'Portfolio Projects',
      desc: 'Build production-ready GitHub repositories and real-world microservice apps.',
      bgColor: 'bg-purple-50 text-purple-600 border-purple-200',
    },
    {
      icon: Briefcase,
      title: 'Career Guidance',
      desc: 'Resume reviews, mock technical interviews, and direct placement opportunities.',
      bgColor: 'bg-rose-50 text-rose-600 border-rose-200',
    },
  ];

  return (
    <section className="py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">
            PLATFORM ADVANTAGE
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-black text-slate-900">
            What You Get in <span className="text-amber-500">SkillPilot Tracks</span>
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 font-medium">
            A comprehensive ecosystem crafted to transform beginners into senior engineers.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {highlights.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 hover:border-slate-300 transition-colors">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${item.bgColor}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black text-slate-900">{item.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">{item.desc}</p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
