'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { PaymentRecord, User } from '@/types';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function loadPayments() {
      try {
        const profileData = await api.getProfile().catch(() => null);
        setUser(profileData);

        const paymentData = profileData?.role === 'mentor'
          ? await api.getPaymentHistoryMentor().catch(() => [])
          : await api.getPaymentHistoryCustomer().catch(() => []);
          
        setPayments(paymentData);
      } catch (err) {
        console.warn('Payments fetch warning:', err);
      }
    }
    loadPayments();
  }, []);

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-black text-slate-900">
            {user?.role === 'mentor' ? 'Course Earnings' : 'Billing & Payment History'}
          </h3>
          <p className="text-xs text-slate-600 font-medium">
            {user?.role === 'mentor'
              ? 'Track the revenue generated from your published courses.'
              : 'Stripe checkout receipts, transaction IDs, and course order history.'}
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-black">
          Stripe Verified
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead>
            <tr className="bg-slate-50 border-y border-slate-200 text-slate-500 font-black uppercase tracking-wider text-[10px]">
              <th className="py-3.5 px-4">Transaction ID</th>
              <th className="py-3.5 px-4">Course Item</th>
              <th className="py-3.5 px-4">Amount</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {payments.length > 0 ? (
              payments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-4 font-mono font-bold text-slate-900">
                    {p.stripe_checkout_session_id || `TXN-${p.id}8291`}
                  </td>
                  <td className="py-4 px-4 font-extrabold text-slate-900">
                    {p.course_title || `Course ID #${p.course}`}
                  </td>
                  <td className="py-4 px-4 font-black text-slate-900">
                    ${p.amount} {p.currency?.toUpperCase() || 'USD'}
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-black capitalize">
                      {p.status || 'Completed'}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-medium text-slate-500">
                    {p.created_at ? new Date(p.created_at).toLocaleDateString() : 'Recent'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-500 font-medium">
                  {user?.role === 'mentor'
                    ? 'No earnings recorded yet. Publish courses and share them to start earning.'
                    : 'No Stripe payment transactions recorded in your account yet.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
