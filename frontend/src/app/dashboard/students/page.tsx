'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api, EnrollmentRecord } from '@/lib/api';
import { User } from '@/types';
import { Users, Search, Loader2 } from 'lucide-react';

export default function StudentsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [enrollments, setEnrollments] = useState<EnrollmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const profileData = await api.getProfile().catch(() => null);
        setUser(profileData);

        if (profileData && profileData.role === 'mentor') {
          const data = await api.getEnrollments().catch(() => []);
          setEnrollments(data);
        } else {
          router.push('/dashboard');
        }
      } catch (err) {
        console.error('Failed to load students data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  if (user && user.role !== 'mentor') return null;

  const filteredEnrollments = enrollments.filter(
    (e) =>
      e.student_name?.toLowerCase().includes(search.toLowerCase()) ||
      e.student_email?.toLowerCase().includes(search.toLowerCase()) ||
      e.course_title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-black text-slate-900">My Students</h3>
          <p className="text-xs text-slate-600 font-medium">Manage and view all students enrolled in your courses.</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 font-medium transition-all"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-[10px] uppercase tracking-wider">
                <th className="p-4">Student</th>
                <th className="p-4">Course</th>
                <th className="p-4">Enrolled Date</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mx-auto" />
                  </td>
                </tr>
              ) : filteredEnrollments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center">
                    <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-black text-slate-900">No students found</p>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      {search ? 'Try adjusting your search query.' : 'You have no enrollments yet.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredEnrollments.map((enrollment) => (
                  <tr key={enrollment.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xs shrink-0">
                          {enrollment.student_name?.charAt(0).toUpperCase() || 'S'}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{enrollment.student_name || 'Unknown Student'}</p>
                          <p className="text-[10px] text-slate-500 font-medium">{enrollment.student_email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-xs font-bold text-slate-900 line-clamp-1">{enrollment.course_title}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-xs font-medium text-slate-600">
                        {new Date(enrollment.enrolled_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </td>
                    <td className="p-4">
                      {enrollment.is_completed ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">
                          Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700">
                          In Progress
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
