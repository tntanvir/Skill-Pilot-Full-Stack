'use client';

import { Smartphone, Download, CheckCircle2 } from 'lucide-react';

export default function AppDownloadBanner() {
  return (
    <section className="py-16 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-100 rounded-3xl p-8 sm:p-12 border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-8 text-slate-900 shadow-sm">
          
          <div className="space-y-4 max-w-xl">
            <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black">
              📱 SKILLPILOT MOBILE APP
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900">
              Learn Anywhere with SkillPilot App
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              Download our mobile application to watch lessons offline, receive instant AI career updates, and track course completion progress anywhere.
            </p>

            <div className="flex items-center space-x-4 text-xs font-bold text-slate-700">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Offline Video Downloads</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Instant AI Push Notifications</span>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-3">
              <button className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs flex items-center gap-2 transition-colors shadow-sm">
                <Download className="w-4 h-4 text-amber-400" />
                <span>Google Play Store</span>
              </button>
              <button className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs flex items-center gap-2 transition-colors shadow-sm">
                <Download className="w-4 h-4 text-amber-400" />
                <span>Apple App Store</span>
              </button>
            </div>
          </div>

          <div className="w-36 h-36 rounded-3xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
            <Smartphone className="w-16 h-16 text-indigo-600" />
          </div>

        </div>
      </div>
    </section>
  );
}
