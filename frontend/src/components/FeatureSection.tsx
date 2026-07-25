'use client';

import { Sparkles, PlayCircle, CreditCard, ShieldCheck } from 'lucide-react';

export default function FeatureSection() {
  const features = [
    {
      icon: Sparkles,
      title: 'Google Gemini AI Advisor',
      desc: 'Type your existing skills and target job in natural language. Our AI counselor automatically queries active database courses to map your optimal learning pathway.',
      iconBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    },
    {
      icon: PlayCircle,
      title: 'Adaptive HLS Video Player',
      desc: 'Stream high-definition lesson content using master playlists (.m3u8). Supports Google Drive integration and resolution switching.',
      iconBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    },
    {
      icon: CreditCard,
      title: 'Secure Stripe Checkout',
      desc: 'One-click credit card checkout powered by Stripe. Automatic webhook event verification enrolls students instantly upon payment.',
      iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    },
    {
      icon: ShieldCheck,
      title: 'Role-Based Access Control',
      desc: 'Granular authorization for Students, Mentors, and Administrators with custom JWT authentication and email OTP verification.',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    },
  ];

  return (
    <section id="features" className="py-24 bg-[#0a0e1a] relative overflow-hidden border-y border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold tracking-widest text-indigo-400 uppercase">
            WHY SKILLPILOT
          </span>
          <h2 className="mt-3 text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Built for <span className="text-indigo-400">Modern Tech Education</span>
          </h2>
          <p className="mt-4 text-base text-slate-400">
            A production-ready full-stack architecture combining artificial intelligence, streaming media, and financial security.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div key={idx} className="card-solid p-8 rounded-3xl relative group hover:border-indigo-500/30 transition-all duration-300">
                <div className="flex items-start space-x-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shrink-0 ${feat.iconBg}`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {feat.title}
                    </h3>
                    <p className="mt-3 text-sm text-slate-400 leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
