'use client';

import React, { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { Lock, Eye, EyeOff, Shield, User as UserIcon, Mail, Briefcase, Camera, Loader2, Save, MapPin, AlignLeft, Bell, Settings, ChevronRight } from 'lucide-react';
import { User } from '@/types';
import { PhoneInputComponent } from '@/components/PhoneInputComponent';
import { motion, AnimatePresence } from 'framer-motion';

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  
  // Password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Profile Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [bio, setBio] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [profileLoading, setProfileLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const data = await api.getProfile();
        setUser(data);
        setFirstName(data.first_name || '');
        setLastName(data.last_name || '');
        setAddress(data.address || '');
        setBio(data.bio || '');
        setPhoneNumber(data.phone_number || '');
        if (data.profile_picture) {
          setPreviewUrl(data.profile_picture);
        }
      } catch (err) {
        console.warn('Failed to fetch user:', err);
      }
    }
    loadUser();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicture(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);

    const formData = new FormData();
    formData.append('first_name', firstName);
    formData.append('last_name', lastName);
    formData.append('address', address);
    formData.append('bio', bio);
    formData.append('phone_number', phoneNumber);
    if (profilePicture) {
      formData.append('profile_picture', profilePicture);
    }

    try {
      const updatedUser = await api.updateProfile(formData);
      setUser(updatedUser);
      toast.success('Profile updated successfully!');
    } catch (err: any) {
      toast.error(`Profile Update Failed: ${err.message}`);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirmation do not match');
      return;
    }
    setPasswordLoading(true);

    try {
      const res = await api.changePassword({
        old_password: oldPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      toast.success(res.message || 'Password updated successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(`Password Change Failed: ${err.message}`);
    } finally {
      setPasswordLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'General Profile', icon: UserIcon, description: 'Manage your personal details' },
    { id: 'security', label: 'Security', icon: Shield, description: 'Update your password and security' },
  ] as const;

  return (
    <div className="min-h-full bg-slate-50 p-4 sm:p-8">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Settings</h1>
        <p className="text-slate-500 mt-2 text-sm max-w-xl">
          Manage your account settings and preferences. Keep your profile updated and secure.
        </p>
      </div>

      <div className="flex flex-col gap-8 max-w-4xl mx-auto">
        {/* Top Navigation */}
        <nav className="flex p-1.5 bg-slate-200/60 rounded-2xl mx-auto border border-slate-200/80 shadow-inner w-full sm:w-auto overflow-x-auto custom-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative flex items-center justify-center gap-3 px-6 sm:px-8 py-3 text-sm font-bold transition-all duration-300 rounded-xl group whitespace-nowrap flex-1 sm:flex-initial ${
                  isActive 
                    ? 'text-indigo-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {/* Active Indicator Background */}
                {isActive && (
                  <motion.div
                    layoutId="activeTabTop"
                    className="absolute inset-0 bg-white rounded-xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.1)] border border-slate-100/50"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
                
                <div className={`relative z-10 flex items-center justify-center p-1.5 rounded-lg transition-colors ${
                  isActive ? 'bg-indigo-50 text-indigo-600' : 'bg-transparent text-slate-400 group-hover:text-slate-600 group-hover:bg-slate-200/50'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                
                <span className="relative z-10 tracking-wide">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Main Content Area */}
        <main className="w-full">
          <AnimatePresence mode="wait">
            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xl shadow-slate-100/50"
              >
                <div className="mb-8 border-b border-slate-100 pb-6">
                  <h2 className="text-2xl font-bold text-slate-900">Personal Information</h2>
                  <p className="text-sm text-slate-500 mt-1">Update your photo and personal details here.</p>
                </div>

                {!user ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                  </div>
                ) : (
                  <form onSubmit={handleProfileSubmit} className="space-y-8">
                    {/* Avatar Section */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 bg-slate-50 rounded-2xl p-6 border border-slate-100">
                      <div 
                        className="relative group cursor-pointer" 
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <div className="w-28 h-28 rounded-full border-4 border-white overflow-hidden shadow-lg shadow-indigo-100/50 transition-transform duration-300 group-hover:scale-105 group-hover:shadow-indigo-200">
                          {previewUrl ? (
                            <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-indigo-50 flex items-center justify-center text-indigo-300">
                              <UserIcon className="w-12 h-12" />
                            </div>
                          )}
                        </div>
                        <div className="absolute inset-0 bg-indigo-900/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm">
                          <Camera className="w-8 h-8 text-white drop-shadow-md" />
                        </div>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleImageChange}
                          accept="image/*"
                          className="hidden"
                        />
                        <div className="absolute -bottom-2 right-0 bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-full border-2 border-white shadow-md uppercase tracking-wider">
                          {user.role}
                        </div>
                      </div>
                      <div className="flex-1 text-center sm:text-left mt-2 sm:mt-0">
                        <h4 className="text-lg font-bold text-slate-900">Profile Picture</h4>
                        <p className="text-sm text-slate-500 mt-1 mb-4">PNG, JPG or GIF up to 5MB. A square image is recommended.</p>
                        <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                          <button 
                            type="button" 
                            onClick={() => fileInputRef.current?.click()}
                            className="text-sm font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-5 py-2.5 rounded-xl transition-colors border border-indigo-200/50"
                          >
                            Upload New Photo
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">First Name</label>
                        <div className="relative group">
                          <UserIcon className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-indigo-500 transition-colors" />
                          <input
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-semibold placeholder-slate-400"
                            placeholder="John"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Last Name</label>
                        <div className="relative group">
                          <UserIcon className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-indigo-500 transition-colors" />
                          <input
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-semibold placeholder-slate-400"
                            placeholder="Doe"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Email Address</label>
                        <div className="relative opacity-75">
                          <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                          <input
                            type="email"
                            value={user.email}
                            disabled
                            className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-sm text-slate-600 cursor-not-allowed font-semibold"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Phone Number</label>
                        <div className="phone-input-wrapper">
                           <PhoneInputComponent 
                            value={phoneNumber} 
                            onChange={setPhoneNumber} 
                          />
                        </div>
                      </div>

                      <div className="md:col-span-2 space-y-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Address</label>
                        <div className="relative group">
                          <MapPin className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-indigo-500 transition-colors" />
                          <input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-semibold placeholder-slate-400"
                            placeholder="123 Main St, City, Country"
                          />
                        </div>
                      </div>

                      <div className="md:col-span-2 space-y-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Bio</label>
                        <div className="relative group">
                          <AlignLeft className="w-4 h-4 text-slate-400 absolute left-4 top-4 group-focus-within:text-indigo-500 transition-colors" />
                          <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            rows={4}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-semibold placeholder-slate-400 resize-none"
                            placeholder="Tell us a little bit about yourself, your skills, and what you're looking to achieve..."
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-6">
                      <button
                        type="submit"
                        disabled={profileLoading}
                        className="px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/40 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 hover:-translate-y-0.5 active:translate-y-0"
                      >
                        {profileLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        {profileLoading ? 'Saving Changes...' : 'Save Profile Changes'}
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div
                key="security"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xl shadow-slate-100/50"
              >
                <div className="mb-8 border-b border-slate-100 pb-6 flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Security & Password</h2>
                    <p className="text-sm text-slate-500 mt-1">Keep your account safe with a strong, unique password.</p>
                  </div>
                  <div className="p-3 bg-rose-50 text-rose-500 rounded-2xl">
                    <Shield className="w-6 h-6" />
                  </div>
                </div>

                <form onSubmit={handleChangePasswordSubmit} className="space-y-6 max-w-xl">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Current Password</label>
                    <div className="relative group">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-slate-700 transition-colors" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-12 py-3.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-200/50 transition-all font-semibold placeholder-slate-400"
                        placeholder="Enter current password"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">New Password</label>
                    <div className="relative group">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-slate-700 transition-colors" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-12 py-3.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-200/50 transition-all font-semibold placeholder-slate-400"
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">Must be at least 8 characters long, including a number and a symbol.</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Confirm New Password</label>
                    <div className="relative group">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-slate-700 transition-colors" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-12 py-3.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-200/50 transition-all font-semibold placeholder-slate-400"
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>

                  <div className="pt-6">
                    <button
                      type="submit"
                      disabled={passwordLoading}
                      className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-lg shadow-slate-900/20 hover:shadow-slate-900/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0"
                    >
                      {passwordLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Shield className="w-5 h-5 text-slate-400" />}
                      {passwordLoading ? 'Updating Password...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
