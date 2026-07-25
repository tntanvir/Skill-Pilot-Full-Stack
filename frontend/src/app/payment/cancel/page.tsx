'use client';

import Link from 'next/link';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col justify-between text-slate-900">
      <div className="max-w-xl mx-auto px-4 py-20 text-center flex-1">
        <div className="w-20 h-20 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto">
          <AlertCircle className="w-10 h-10 text-rose-600" />
        </div>

        <h1 className="mt-6 text-3xl font-black text-slate-900">
          Payment Canceled
        </h1>
        <p className="mt-2 text-sm text-slate-600 font-medium">
          The Stripe checkout process was canceled. No charges were made to your account.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/courses"
            className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 font-bold text-xs text-slate-900 flex items-center gap-2 transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 text-slate-700" />
            <span>Return to Course Explorer</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
