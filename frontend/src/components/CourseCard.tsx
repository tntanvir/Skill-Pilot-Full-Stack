'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Course } from '@/types';
import { User, ArrowRight } from 'lucide-react';

export default function CourseCard({ course, isManageable = false }: { course: Course, isManageable?: boolean }) {
  const getLevelBadgeColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'beginner':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'intermediate':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'advanced':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const categoryName = typeof course.category === 'object' && course.category?.name
    ? course.category.name
    : (course.category_name || '');

  const getFallbackThumbnail = (catName?: string, title?: string) => {
    const text = `${catName || ''} ${title || ''}`.toLowerCase();
    if (text.includes('mobile') || text.includes('flutter') || text.includes('android') || text.includes('kotlin') || text.includes('react native') || text.includes('ios')) {
      return 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=800&auto=format&fit=crop';
    }
    if (text.includes('devops') || text.includes('docker') || text.includes('kubernetes') || text.includes('aws') || text.includes('cloud')) {
      return 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?q=80&w=800&auto=format&fit=crop';
    }
    if (text.includes('ai') || text.includes('intelligence') || text.includes('python') || text.includes('machine') || text.includes('data') || text.includes('llm') || text.includes('learning')) {
      return 'https://images.unsplash.com/photo-1677442136019-21780efad99a?q=80&w=800&auto=format&fit=crop';
    }
    if (text.includes('network') || text.includes('security') || text.includes('ccna') || text.includes('cisco') || text.includes('cyber') || text.includes('ethical') || text.includes('hacking')) {
      return 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=800&auto=format&fit=crop';
    }
    if (text.includes('backend') || text.includes('django') || text.includes('node') || text.includes('fastapi') || text.includes('express') || text.includes('sql') || text.includes('database')) {
      return 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop';
    }
    if (text.includes('ui') || text.includes('ux') || text.includes('design') || text.includes('figma')) {
      return 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?q=80&w=800&auto=format&fit=crop';
    }
    return 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=800&auto=format&fit=crop';
  };

  const cleanThumbnailUrl = (rawUrl?: string | null) => {
    if (!rawUrl) return null;
    try {
      const unquoted = decodeURIComponent(rawUrl);
      if (unquoted.includes('http://') || unquoted.includes('https://')) {
        const match = unquoted.match(/https?:\/\/[^\s"']+/);
        if (match) return match[0];
      }
      if (unquoted.startsWith('/')) {
        const backendBase = process.env.NEXT_PUBLIC_API_URL
          ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, '')
          : 'http://127.0.0.1:8000';
        return `${backendBase}${unquoted}`;
      }
    } catch {
      // Ignore decode error
    }
    return rawUrl;
  };

  const fallback = getFallbackThumbnail(categoryName, course.title);
  const initialThumbnail = cleanThumbnailUrl(course.thumbnail) || fallback;

  const [imgSrc, setImgSrc] = useState<string>(initialThumbnail);

  useEffect(() => {
    const updatedUrl = cleanThumbnailUrl(course.thumbnail) || fallback;
    setImgSrc(updatedUrl);
  }, [course.id, course.thumbnail, course.category_name, course.title]);

  const formattedPrice = Number(course.price) === 0 ? 'Free' : `$${course.price}`;

  return (
    <div className="bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-500 flex flex-col justify-between group">
      
      {/* Thumbnail Area with Real Image */}
      <div className="relative h-48 w-full bg-slate-950 overflow-hidden border-b border-slate-200">
        
        {/* Course Thumbnail Image */}
        <img
          src={imgSrc}
          alt={course.title}
          onError={() => setImgSrc(fallback)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-95"
        />

        {/* Dark Gradient Overlay for Badges readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/30 pointer-events-none group-hover:opacity-80 transition-opacity duration-500" />

        {/* Category Pill */}
        <div className="absolute top-4 left-4 z-10">
          <span className="px-3 py-1.5 rounded-full text-[10px] uppercase tracking-wider font-black bg-white/20 backdrop-blur-md text-white shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-white/30">
            {categoryName || 'Technology'}
          </span>
        </div>

        {/* Level Tag */}
        <div className="absolute top-4 right-4 z-10">
          <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-black shadow-lg ${getLevelBadgeColor(course.level)}`}>
            {course.level}
          </span>
        </div>

      </div>

      {/* Course Details Content */}
      <div className="p-6 flex-1 flex flex-col justify-between bg-white relative">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
        
        <div>
          <h3 className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
            {course.title}
          </h3>
          <p className="mt-2.5 text-sm text-slate-500 line-clamp-2 leading-relaxed font-medium">
            {course.description || 'Master real-world skills with expert guidance and adaptive hands-on learning modules.'}
          </p>
        </div>

        <div className="mt-6 pt-5 border-t border-slate-100/80 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200/80 flex items-center justify-center shadow-sm">
              <User className="w-4 h-4 text-indigo-500" />
            </div>
            <span className="text-xs text-slate-600 font-bold">
              {course.mentor?.username || 'Senior Instructor'}
            </span>
          </div>

          <div className="text-right">
            <span className="text-xl font-black text-slate-900 tracking-tight">
              {formattedPrice}
            </span>
          </div>
        </div>

        {/* Bottom CTA Button */}
        <div className="mt-5 flex flex-col gap-2.5">
          <Link
            href={`/courses/${course.slug}`}
            className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white flex items-center justify-center gap-2 transition-all duration-300 shadow-[0_4px_14px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] group/btn"
          >
            <span>View Course Details</span>
            <ArrowRight className="w-4 h-4 text-amber-400 group-hover/btn:translate-x-1 transition-transform" />
          </Link>
          
          {isManageable && (
            <Link
              href={`/dashboard/courses/${course.slug}/manage`}
              className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 text-xs font-black flex items-center justify-center gap-2 transition-all duration-300 shadow-[0_4px_14px_rgba(251,191,36,0.3)] hover:shadow-[0_6px_20px_rgba(251,191,36,0.4)]"
            >
              <span>Manage Modules & Lessons</span>
            </Link>
          )}
        </div>

      </div>
    </div>
  );
}
