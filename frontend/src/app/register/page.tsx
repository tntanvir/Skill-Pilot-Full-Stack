'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import toast, { Toaster } from 'react-hot-toast';
import { ArrowRight, Compass, Eye, EyeOff, Lock } from 'lucide-react';
import { PhoneInputComponent } from '@/components/PhoneInputComponent';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<'register' | 'otp'>('register');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone_number: '',
    password: '',
    confirm_password: '',
    role: 'student' as 'student' | 'mentor',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);

    try {
      await api.register(formData);
      toast.success('OTP email sent to your inbox!');
      setStep('otp');
    } catch (err: any) {
      toast.error(`Registration Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.verifyOTP({ email: formData.email, otp, purpose: 'registration' });
      toast.success('Email verified successfully! Please log in.');
      router.push('/login');
    } catch (err: any) {
      toast.error(`OTP Verification Error: ${err.message || 'OTP verification failed.'}`);
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
            <h2 className="text-2xl font-black text-slate-900">
              {step === 'register' ? 'Create SkillPilot Account' : 'Verify Email OTP'}
            </h2>
            <p className="text-xs text-slate-600 font-medium">
              {step === 'register' ? 'Join our platform as a student or mentor' : `Enter the 6-digit OTP code sent to ${formData.email}`}
            </p>
          </div>

          {step === 'register' ? (
            <form onSubmit={handleRegisterSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="johndoe"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="johndoe@example.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white font-medium"
                />
              </div>

              <div>
                <PhoneInputComponent 
                  value={formData.phone_number} 
                  onChange={(phone) => setFormData({ ...formData, phone_number: phone })} 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'student' | 'mentor' })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white font-bold"
                >
                  <option value="student">Student / Learner</option>
                  <option value="mentor">Instructor / Mentor</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirm_password}
                    onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 p-0.5 focus:outline-none transition-colors"
                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? (
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
                <span>{loading ? 'Creating Account...' : 'Continue to OTP Verification'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">OTP Code</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-center text-lg font-bold tracking-widest text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 font-black text-xs text-slate-950 shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Verifying OTP...' : 'Verify & Login'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-xs text-slate-600 font-medium">
            Already have an account?{' '}
            <Link href="/login" className="text-indigo-600 hover:underline font-bold">
              Sign in here
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}
