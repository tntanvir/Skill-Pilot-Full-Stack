'use client';

import { Smartphone, Cloud, Shield, Brain, Server, Layout, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default function CategoryGrid() {
  const categories = [
    {
      icon: Smartphone,
      title: 'Mobile App Development',
      desc: 'iOS & Android, Flutter, React Native, Kotlin',
      iconBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
      count: '3 Courses',
    },
    {
      icon: Cloud,
      title: 'DevOps & Cloud Infrastructure',
      desc: 'Docker, Kubernetes, AWS Architect, CI/CD',
      iconBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
      count: '2 Courses',
    },
    {
      icon: Shield,
      title: 'Networking & Cybersecurity',
      desc: 'Cisco CCNA, TCP/IP, Ethical Hacking & Defense',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      count: '2 Courses',
    },
    {
      icon: Brain,
      title: 'AI & Data Science',
      desc: 'Generative AI, PyTorch, LLMs, Machine Learning',
      iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      count: '2 Courses',
    },
    {
      icon: Server,
      title: 'Backend Development',
      desc: 'Django, FastAPI, Node.js & Express REST APIs',
      iconBg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      count: '3 Courses',
    },
    {
      icon: Layout,
      title: 'UI/UX Design',
      desc: 'Figma Design Systems, Wireframing, User Research',
      iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      count: '1 Course',
    },
  ];

  return (
    <section className="py-20 bg-[#070a12] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold tracking-widest text-indigo-400 uppercase">
            EXPLORE DOMAINS
          </span>
          <h2 className="mt-3 text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Explore Modern <span className="text-indigo-400">Tech Specialties</span>
          </h2>
          <p className="mt-4 text-base text-slate-400">
            Select a learning track tailored for your career advancement.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <Link
                key={idx}
                href="/courses"
                className="card-solid card-hover p-6 rounded-2xl relative group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${cat.iconBg}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                      {cat.count}
                    </span>
                  </div>

                  <h3 className="mt-5 text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">
                    {cat.title}
                  </h3>
                  <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                    {cat.desc}
                  </p>
                </div>

                <div className="mt-6 flex items-center gap-1 text-xs font-semibold text-indigo-400 group-hover:text-indigo-300 transition-colors">
                  <span>Browse Category</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
}
