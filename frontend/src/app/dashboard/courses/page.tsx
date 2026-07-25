'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CourseCard from '@/components/CourseCard';
import { api } from '@/lib/api';
import { Course, User } from '@/types';
import { BookOpen, ArrowRight, Plus } from 'lucide-react';

export default function CoursesPage() {
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCourses() {
      try {
        const profileData = await api.getProfile().catch(() => null);
        setUser(profileData);

        const myCoursesData = await api.getMyCourses().catch(() => null);
        if (Array.isArray(myCoursesData)) {
          setEnrolledCourses(myCoursesData);
        } else {
          setEnrolledCourses([]);
        }
      } catch (err) {
        console.warn('Courses fetch warning:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCourses();
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-black text-slate-900">
            {user?.role === 'mentor' ? 'Manage Courses' : 'My Enrolled Courses'}
          </h3>
          <p className="text-xs text-slate-600 font-medium">
            {user?.role === 'mentor' 
              ? 'View and manage the courses you have published to the platform.' 
              : 'Access your active learning materials, code repositories, and streaming video lessons.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {user?.role === 'mentor' && (
            <Link
              href="/dashboard/courses/create"
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black shadow-xs flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Course</span>
            </Link>
          )}
          <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 border border-indigo-200 px-3 py-2 rounded-xl whitespace-nowrap">
            {enrolledCourses.length} {user?.role === 'mentor' ? 'Published' : 'Active Tracks'}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-96 bg-slate-200 rounded-3xl" />
          ))}
        </div>
      ) : enrolledCourses.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto" />
          <h4 className="mt-3 text-lg font-black text-slate-900">
            {user?.role === 'mentor' ? 'No Courses Published Yet' : 'No Enrolled Courses Found'}
          </h4>
          <p className="text-xs text-slate-600 font-medium mt-1">
            {user?.role === 'mentor' 
              ? 'Start sharing your knowledge by creating your first course.' 
              : 'Explore our course database and enroll today to unlock project modules.'}
          </p>
          {user?.role === 'mentor' ? (
            <Link
              href="/dashboard/courses/create"
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-xs"
            >
              <span>Create New Course</span>
              <Plus className="w-4 h-4" />
            </Link>
          ) : (
            <Link
              href="/courses"
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-xs"
            >
              <span>Browse Course Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrolledCourses.map((course) => (
            <CourseCard key={course.id} course={course} isManageable={user?.role === 'mentor'} />
          ))}
        </div>
      )}
    </div>
  );
}
