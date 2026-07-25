'use client';

import Link from 'next/link';
import { Compass, Heart, ShieldCheck, CreditCard } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white text-slate-700 border-t border-slate-200/50 pt-20 pb-12 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent opacity-50" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-slate-200">
          
          {/* Col 1 & 2: Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-amber-400 flex items-center justify-center shadow-sm">
                <Compass className="w-5 h-5 text-slate-950 font-black" />
              </div>
              <span className="text-xl font-black text-slate-900">
                Skill<span className="text-indigo-600">Pilot</span> AI
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-slate-600 max-w-sm font-medium">
              Next-generation e-learning and career advisor platform built with Django REST Framework, Google Gemini AI, and Stripe Payment Gateway. University Capstone Project 2026.
            </p>
            <div className="flex items-center space-x-2 text-xs text-slate-800 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Cryptographically Secured & Verified Platform</span>
            </div>
          </div>

          {/* Col 3: Navigation */}
          <div>
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Quick Navigation</h4>
            <ul className="mt-4 space-y-2 text-xs font-semibold">
              <li>
                <Link href="/" className="hover:text-indigo-600 transition-colors">Home</Link>
              </li>
              <li>
                <Link href="/courses" className="hover:text-indigo-600 transition-colors">Explore All Courses</Link>
              </li>
              <li>
                <a href="#features" className="hover:text-indigo-600 transition-colors">Platform Architecture</a>
              </li>
              <li>
                <Link href="/login" className="hover:text-indigo-600 transition-colors">Student Login</Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-indigo-600 transition-colors">Register Account</Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Top Tracks */}
          <div>
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Top Skill Tracks</h4>
            <ul className="mt-4 space-y-2 text-xs font-semibold">
              <li><span className="hover:text-indigo-600 cursor-pointer">Mobile App Development</span></li>
              <li><span className="hover:text-indigo-600 cursor-pointer">DevOps & Cloud Architecture</span></li>
              <li><span className="hover:text-indigo-600 cursor-pointer">Cybersecurity & CCNA</span></li>
              <li><span className="hover:text-indigo-600 cursor-pointer">Artificial Intelligence & LLMs</span></li>
              <li><span className="hover:text-indigo-600 cursor-pointer">Backend Django & Node.js</span></li>
            </ul>
          </div>

          {/* Col 5: Payment & Tech Stack */}
          <div>
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Monetization & Tech</h4>
            <p className="mt-4 text-xs text-slate-600 mb-3 font-medium">
              Automated Stripe Checkout Session & Real-time Webhook listener.
            </p>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-900 flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
                <span>Stripe Gateway</span>
              </span>
              <span className="px-2.5 py-1 rounded bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-800">
                SSL Secured
              </span>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-medium">
          <p>© 2026 SkillPilot. University Final Year Capstone Project by Tanvir & Team.</p>
          <div className="flex items-center space-x-2 mt-4 sm:mt-0">
            <span>Built with precision & passion</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          </div>
        </div>

      </div>
    </footer>
  );
}
