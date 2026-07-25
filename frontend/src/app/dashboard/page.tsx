'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { User, Course, DashboardStats } from '@/types';
import {
  BookOpen,
  Sparkles,
  Award,
  Clock,
  CheckCircle2,
  PlayCircle,
  Users,
  DollarSign,
  TrendingUp,
  Star,
  ArrowRight,
} from 'lucide-react';

export default function DashboardOverviewPage() {
  const [activityTimeframe, setActivityTimeframe] = useState<'weekly' | 'monthly'>('weekly');
  const [user, setUser] = useState<User | null>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const profileData = await api.getProfile().catch(() => null);
        if (profileData) {
          setUser(profileData);
        } else {
          setUser({
            id: 1,
            email: 'user@example.com',
            username: 'SkillPilot Learner',
            role: 'student',
            is_email_verified: true,
          });
        }

        const statsData = await api.getDashboardStats().catch(() => null);
        if (statsData) {
          setStats(statsData);
        }

        const myCoursesData = await api.getMyCourses().catch(() => null);
        if (Array.isArray(myCoursesData)) {
          setEnrolledCourses(myCoursesData);
        } else {
          setEnrolledCourses([]);
        }
      } catch (err) {
        console.warn('Dashboard fetch warning:', err);
      }
    }
    loadDashboardData();
  }, []);

  return (
    <>
      {/* Header Greeting Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-400 text-slate-950 font-black text-xl flex items-center justify-center shadow-md shrink-0">
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                Welcome back, {user?.first_name || user?.username || 'Learner'}!
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold capitalize">
                {user?.role || 'Student'}
              </span>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 font-medium">
              {user?.role === 'mentor' 
                ? 'Manage your published courses, track student enrollments, and view earnings.'
                : 'Track your learning activity, access enrolled modules, and consult your AI career advisor.'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {user?.role === 'mentor' ? (
            <Link
              href="/dashboard/courses/create"
              className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black shadow-xs flex items-center gap-2 transition-all"
            >
              <BookOpen className="w-4 h-4" />
              <span>Create New Course</span>
            </Link>
          ) : (
            <>
              <Link
                href="/dashboard/ai-chat"
                className="px-4 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold flex items-center gap-2 transition-all"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Launch AI Counselor</span>
              </Link>
              <Link
                href="/courses"
                className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black shadow-xs flex items-center gap-2 transition-all"
              >
                <BookOpen className="w-4 h-4" />
                <span>Explore Courses</span>
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="space-y-8 animate-fadeIn">
        {user?.role === 'mentor' ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">Published Courses</span>
                  <div className="mt-1 text-3xl font-black text-slate-900">{stats?.total_published_courses ?? 0}</div>
                  <span className="text-[11px] text-indigo-600 font-bold mt-1 block">Live in catalog</span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-200">
                  <BookOpen className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">Total Students</span>
                  <div className="mt-1 text-3xl font-black text-slate-900">{stats?.total_students_enrolled ?? 0}</div>
                  <span className="text-[11px] text-emerald-600 font-bold mt-1 block">Enrolled across courses</span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
                  <Users className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">Total Earnings</span>
                  <div className="mt-1 text-3xl font-black text-slate-900">${(stats?.total_earnings ?? 0).toFixed(2)}</div>
                  <span className="text-[11px] text-amber-600 font-bold mt-1 block">Lifetime revenue</span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Mentor Analytics & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Earnings Chart (7 cols) */}
              <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-indigo-600" />
                    Weekly Earnings
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Your revenue over the last 7 days</p>
                </div>
                
                <div className="pt-4 flex items-end justify-between h-44 border-b border-slate-100 pb-2 px-2 gap-2">
                  {(
                    stats?.weekly_earnings || [
                      { day: 'Mon', amount: 0, height: '0%' },
                      { day: 'Tue', amount: 0, height: '0%' },
                      { day: 'Wed', amount: 0, height: '0%' },
                      { day: 'Thu', amount: 0, height: '0%' },
                      { day: 'Fri', amount: 0, height: '0%' },
                      { day: 'Sat', amount: 0, height: '0%' },
                      { day: 'Sun', amount: 0, height: '0%' },
                    ]
                  ).map((bar, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                      <span className="text-[10px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        ${bar.amount.toFixed(0)}
                      </span>
                      <div className="w-full bg-slate-100 rounded-t-xl h-36 flex items-end p-1">
                        <div
                          style={{ height: bar.height }}
                          className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-lg transition-all duration-500 group-hover:brightness-110"
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-600">{bar.day}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Courses (5 cols) */}
              <div className="lg:col-span-5 bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 p-6 sm:p-8 rounded-3xl text-white shadow-md flex flex-col justify-between space-y-6">
                <div>
                  <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black inline-block mb-3">
                    📚 RECENT COURSES
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black leading-snug">Quick Management</h3>
                </div>
                <div className="space-y-3 flex-1 overflow-y-auto max-h-48 pr-2 custom-scrollbar">
                  {stats?.recent_courses && stats.recent_courses.length > 0 ? (
                    stats.recent_courses.map(course => (
                      <Link
                        key={course.id}
                        href={`/dashboard/courses/${course.slug}/manage`}
                        className="block bg-slate-800/50 hover:bg-slate-700/50 p-4 rounded-2xl border border-slate-700 transition-colors"
                      >
                        <h4 className="font-bold text-sm truncate">{course.title}</h4>
                        <p className="text-[10px] text-slate-400 mt-1">Created: {new Date(course.created_at).toLocaleDateString()}</p>
                      </Link>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic">No courses created yet.</p>
                  )}
                </div>
                <Link
                  href="/dashboard/courses/create"
                  className="w-full py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <BookOpen className="w-4 h-4 fill-slate-950 text-amber-400" />
                  <span>Create a New Course</span>
                </Link>
              </div>
            </div>

            {/* Recent Enrollments & Feedback */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Enrollments */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-black text-slate-900 mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-600" /> Recent Enrollments
                </h3>
                <div className="space-y-4">
                  {stats?.recent_enrollments && stats.recent_enrollments.length > 0 ? (
                    stats.recent_enrollments.map((enrollment, idx) => (
                      <div key={idx} className="flex items-center justify-between pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                        <div>
                          <p className="font-bold text-sm text-slate-800">{enrollment.student_name}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{enrollment.course_title}</p>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                          {new Date(enrollment.date).toLocaleDateString()}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 italic">No recent enrollments.</p>
                  )}
                </div>
              </div>

              {/* Reviews */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-black text-slate-900 mb-4 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> Recent Feedback
                </h3>
                <div className="space-y-4">
                  {stats?.recent_reviews && stats.recent_reviews.length > 0 ? (
                    stats.recent_reviews.map((review, idx) => (
                      <div key={idx} className="pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-bold text-sm text-slate-800">{review.student_name}</p>
                          <div className="flex items-center gap-0.5">
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                            <span className="text-[11px] font-bold text-slate-600">{review.rating}.0</span>
                          </div>
                        </div>
                        <p className="text-[11px] text-indigo-600 font-semibold mb-1 line-clamp-1">{review.course_title}</p>
                        <p className="text-xs text-slate-600 line-clamp-2">"{review.comment}"</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 italic">No recent reviews.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">Enrolled Courses</span>
              <div className="mt-1 text-3xl font-black text-slate-900">{stats?.enrolled_courses_count ?? enrolledCourses.length}</div>
              <span className="text-[11px] text-indigo-600 font-bold mt-1 block">Total Enrolled</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-200">
              <BookOpen className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">Learning Hours</span>
              <div className="mt-1 text-3xl font-black text-slate-900">{stats?.learning_hours ?? 0} hrs</div>
              <span className="text-[11px] text-slate-500 font-bold mt-1 block">{stats?.study_velocity || '0 hrs logged'}</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">Lessons Completed</span>
              <div className="mt-1 text-3xl font-black text-slate-900">{stats?.lessons_completed ?? 0}</div>
              <span className="text-[11px] text-emerald-600 font-bold mt-1 block">{stats?.average_score || 'No quiz data'}</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">Certificates Earned</span>
              <div className="mt-1 text-3xl font-black text-slate-900">{stats?.certificates_count ?? 0} Verified</div>
              <span className="text-[11px] text-indigo-600 font-bold mt-1 block">LinkedIn shareable</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200">
              <Award className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Weekly Activity & Active Resume Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Analytics Activity Chart Box (7 cols) */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  {activityTimeframe === 'weekly' ? 'Weekly Learning Activity' : 'Monthly Learning Activity'}
                </h3>
                <p className="text-xs text-slate-500 font-medium">Hours spent watching lessons and building projects</p>
              </div>

              {/* Weekly / Monthly Toggle Buttons */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
                <button
                  onClick={() => setActivityTimeframe('weekly')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    activityTimeframe === 'weekly'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setActivityTimeframe('monthly')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    activityTimeframe === 'monthly'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Monthly
                </button>
              </div>
            </div>

            {/* Visual Analytics Bar Chart */}
            <div className="pt-4 flex items-end justify-between h-44 border-b border-slate-100 pb-2 px-2 gap-2">
              {(
                (activityTimeframe === 'weekly' ? stats?.weekly_activity : stats?.monthly_activity) || [
                  { day: 'Mon', hours: 0, height: '0%' },
                  { day: 'Tue', hours: 0, height: '0%' },
                  { day: 'Wed', hours: 0, height: '0%' },
                  { day: 'Thu', hours: 0, height: '0%' },
                  { day: 'Fri', hours: 0, height: '0%' },
                  { day: 'Sat', hours: 0, height: '0%' },
                  { day: 'Sun', hours: 0, height: '0%' },
                ]
              ).map((bar, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {bar.hours}h
                  </span>
                  <div className="w-full bg-slate-100 rounded-t-xl h-36 flex items-end p-1">
                    <div
                      style={{ height: bar.height }}
                      className="w-full bg-gradient-to-t from-indigo-600 to-amber-400 rounded-t-lg transition-all duration-500 group-hover:brightness-110"
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-600">{bar.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Resume Learning Spotlight (5 cols) */}
          {stats?.last_active_course || enrolledCourses.length > 0 ? (
            <div className="lg:col-span-5 bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 p-6 sm:p-8 rounded-3xl text-white shadow-md flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black inline-block">
                  ⚡ CONTINUE LEARNING
                </span>
                <h3 className="text-xl sm:text-2xl font-black leading-snug">
                  {stats?.last_active_course?.title || enrolledCourses[0]?.title}
                </h3>
                <p className="text-xs text-slate-300 font-medium line-clamp-2">
                  {stats?.last_active_course?.current_module_title || 'Module 1: Getting Started'}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-1.5">
                    <span>Overall Completion</span>
                    <span className="text-amber-400">{stats?.last_active_course?.completion_percentage || 65}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                    <div
                      style={{ width: `${stats?.last_active_course?.completion_percentage || 65}%` }}
                      className="bg-gradient-to-r from-amber-400 to-emerald-400 h-full rounded-full transition-all duration-500"
                    />
                  </div>
                </div>

                <Link
                  href={
                    stats?.last_active_course?.slug
                      ? `/courses/${stats.last_active_course.slug}`
                      : enrolledCourses[0]
                      ? `/courses/${enrolledCourses[0].slug}`
                      : '/courses'
                  }
                  className="w-full py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <PlayCircle className="w-4 h-4 fill-slate-950 text-amber-400" />
                  <span>Resume Current Lesson</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 p-6 sm:p-8 rounded-3xl text-white shadow-md flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-black inline-block">
                  🚀 START YOUR LEARNING JOURNEY
                </span>
                <h3 className="text-xl sm:text-2xl font-black leading-snug">
                  No Enrolled Courses Yet
                </h3>
                <p className="text-xs text-slate-300 font-medium leading-relaxed">
                  You are not enrolled in any active course. Explore our AI-driven technical catalog and begin mastering new career skills today!
                </p>
              </div>

              <Link
                href="/courses"
                className="w-full py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <BookOpen className="w-4 h-4 text-slate-950" />
                <span>Explore Course Catalog</span>
              </Link>
            </div>
          )}
        </div>
          </>
        )}
      </div>
    </>
  );
}
