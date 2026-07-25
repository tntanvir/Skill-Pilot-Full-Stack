'use client';

import { useState, useEffect } from 'react';
import { Star, User, GraduationCap } from 'lucide-react';
import { api } from '@/lib/api';

const defaultReviews = [
  {
    student_name: 'Tanvir Hossain',
    course_title: 'Backend Engineer @ TechCorp',
    comment: 'SkillPilot AI suggested the Django & FastAPI microservices track based on my Python background. Within 3 months I landed my dream backend developer position!',
    rating: 5,
  },
  {
    student_name: 'Nusrat Jahan',
    course_title: 'Flutter Mobile App Developer',
    comment: 'The adaptive HLS video player and live project curriculums made learning Flutter seamless. The Stripe payment flow was super smooth!',
    rating: 5,
  },
  {
    student_name: 'Rahim Ahmed',
    course_title: 'DevOps & AWS Specialist',
    comment: 'Docker & Kubernetes mastery course transformed my infrastructure skills. The AI career advisor guided me step-by-step.',
    rating: 5,
  },
  {
    student_name: 'Sabrina Islam',
    course_title: 'AI & Data Science Student',
    comment: 'Mastering PyTorch and LLMs with Gemini API guidance was the highlight of my final year project. Highly recommend SkillPilot!',
    rating: 5,
  },
];

export default function TestimonialGrid() {
  const [reviews, setReviews] = useState<any[]>(defaultReviews);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const data = await api.getReviews();
        if (data && data.length > 0) {
          // If we have less than 4 reviews, duplicate them so the marquee still works nicely
          let displayReviews = [...data];
          while (displayReviews.length < 4) {
            displayReviews = [...displayReviews, ...data];
          }
          setReviews(displayReviews);
        }
      } catch (err) {
        console.warn('Failed to fetch reviews', err);
      }
    }
    fetchReviews();
  }, []);

  // Duplicate the array for a seamless infinite marquee effect
  const marqueeItems = [...reviews, ...reviews];

  return (
    <section className="py-20 bg-white border-b border-slate-200 overflow-hidden relative">
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marquee 40s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 mb-14">
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">
            STUDENT SUCCESS
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-black text-slate-900">
            What Our <span className="text-amber-500">Learners Say</span>
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 font-medium">
            Real feedback from students and engineers who launched their careers using SkillPilot.
          </p>
        </div>
      </div>

      <div className="w-full overflow-hidden relative">
        {/* Gradient fades on left and right for seamless look */}
        <div className="absolute top-0 left-0 w-16 md:w-40 h-full bg-gradient-to-r from-white to-transparent z-20 pointer-events-none" />
        <div className="absolute top-0 right-0 w-16 md:w-40 h-full bg-gradient-to-l from-white to-transparent z-20 pointer-events-none" />
        
        <div className="animate-marquee gap-6 px-4">
          {marqueeItems.map((rev, idx) => (
            <div key={idx} className="w-[320px] sm:w-[380px] shrink-0 bg-white p-7 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between space-y-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/5 rounded-full blur-3xl group-hover:bg-amber-400/10 transition-colors duration-500 pointer-events-none" />
              <div className="space-y-4 relative z-10">
                <div className="flex items-center space-x-1">
                  {[...Array(rev.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400 drop-shadow-sm" />
                  ))}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                  "{rev.comment}"
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center space-x-3 relative z-10">
                <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center shadow-inner shrink-0">
                  <User className="w-5 h-5 text-indigo-500" />
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-sm font-black text-slate-900 truncate">{rev.student_name}</h4>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 truncate flex items-center gap-1 mt-0.5">
                    <GraduationCap className="w-3 h-3 shrink-0" />
                    <span className="truncate">{rev.course_title || 'SkillPilot Course'}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
