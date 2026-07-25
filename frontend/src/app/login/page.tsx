'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Compass } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Derive admin URL from NEXT_PUBLIC_API_URL
  const adminUrl = process.env.NEXT_PUBLIC_API_URL 
    ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, '/admin/') 
    : 'http://127.0.0.1:8000/admin/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.login({ email, password });
      if (res.tokens?.access) {
        toast.success('Login successful!');
        router.push('/dashboard');
      } else {
        toast.error('Login failed. Please check credentials.');
      }
    } catch (err: any) {
      toast.error(`Login Error: ${err.message || 'Unable to connect to backend.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-slate-900">
      
      {/* Brand Header Link */}
      <Link href="/" className="mb-6 flex items-center space-x-3 group">
        <div className="w-10 h-10 rounded-xl bg-amber-400 flex items-center justify-center shadow-sm">
          <Compass className="w-6 h-6 text-slate-950 font-bold" />
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-1.5">
            Skill<span className="text-indigo-600">Pilot</span>
          </span>
          <span className="text-[10px] text-slate-500 font-semibold tracking-wider">CAREER ENGINE</span>
        </div>
      </Link>

      <div className="max-w-md w-full">
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl">
          
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-slate-900">Welcome Back</h2>
            <p className="text-xs text-slate-600 font-medium">Sign in to your SkillPilot account</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="johndoe@example.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">Password</label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 p-0.5 focus:outline-none transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-indigo-600" />
                  ) : (
                    <Eye className="w-4 h-4 text-slate-400" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 font-black text-xs text-slate-950 shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-600 font-medium">
            Don't have an account?{' '}
            <Link href="/register" className="text-indigo-600 hover:underline font-bold">
              Register here
            </Link>
          </p>

          <p className="mt-2 text-center text-[10px] text-slate-500 font-semibold">
            Are you an administrator?{' '}
            <a href={adminUrl} className="text-indigo-500 hover:underline font-bold">
              Login as Admin
            </a>
          </p>

        </div>
      </div>
    </div>
  );
}
