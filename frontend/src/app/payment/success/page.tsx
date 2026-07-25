'use client';

import Link from 'next/link';
import { CheckCircle2, ArrowRight, BookOpen, ShieldCheck } from 'lucide-react';

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col justify-between text-slate-900">
      <div className="max-w-xl mx-auto px-4 py-20 text-center flex-1">
        <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto animate-bounce">
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
        </div>

        <h1 className="mt-6 text-3xl font-black text-slate-900">
          Payment Successful!
        </h1>
        <p className="mt-2 text-sm text-slate-600 font-medium">
          Your Stripe payment has been confirmed. Our automated webhook has activated your enrollment in the course.
        </p>

        <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-3 shadow-sm">
          <div className="flex items-center space-x-3 text-xs font-bold text-slate-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Cryptographically verified Stripe Webhook receipt</span>
          </div>
          <div className="flex items-center space-x-3 text-xs font-bold text-slate-700">
            <BookOpen className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>Full lifetime access to video modules unlocked</span>
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/courses"
            className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 font-black text-xs text-slate-950 shadow-sm hover:scale-105 transition-all flex items-center gap-2"
          >
            <span>Start Learning Now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
