'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import AIChatWidget from '@/components/AIChatWidget';
import { api } from '@/lib/api';
import { CourseDetail, Lesson } from '@/types';
import {
  PlayCircle,
  Lock,
  ShieldCheck,
  User,
  Clock,
  Zap,
  Loader2,
  CheckCircle2,
  Star,
  Award,
  BookOpen,
  ChevronDown,
  ChevronUp,
  X,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import EnrolledCoursePlayer from '@/components/EnrolledCoursePlayer';

const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });

export default function CourseDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  // Active Video State
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [activeLessonTitle, setActiveLessonTitle] = useState<string | null>(null);

  // Accordion State for Modules
  const [openModuleIds, setOpenModuleIds] = useState<number[]>([101, 1]);

  // Hero Background Image State
  const [heroImgSrc, setHeroImgSrc] = useState<string>('');

  const playerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadDetail() {
      if (!slug) return;
      try {
        const data = await api.getCourseDetail(slug);
        setCourse(data);
        // Automatically open first module
        if (data.modules && data.modules.length > 0) {
          setOpenModuleIds([data.modules[0].id]);
        }
      } catch (err) {
        console.warn('Could not fetch course detail from API, using fallback data:', err);
        setCourse(mockDetail);
        setOpenModuleIds([mockDetail.modules[0].id]);
      } finally {
        setLoading(false);
      }
    }
    loadDetail();
  }, [slug]);

  useEffect(() => {
    const targetCourse = course || mockDetail;
    const catName = typeof targetCourse.category === 'object' && targetCourse.category?.name
      ? targetCourse.category.name
      : (targetCourse.category_name || '');
    const fallbackHero = getFallbackThumbnail(catName, targetCourse.title);
    const initialHeroBg = cleanThumbnailUrl(targetCourse.thumbnail) || fallbackHero;
    setHeroImgSrc(initialHeroBg);
  }, [course]);

  const toggleModule = (id: number) => {
    setOpenModuleIds((prev) =>
      prev.includes(id) ? prev.filter((mId) => mId !== id) : [...prev, id]
    );
  };

  const handlePlayLessonVideo = (lesson: Lesson) => {
    const videoUrl = lesson.video_url || 'https://www.w3schools.com/html/mov_bbb.mp4';
    setActiveVideoUrl(videoUrl);
    setActiveLessonTitle(lesson.title);

    // Smooth scroll to top video player
    playerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleCheckout = async () => {
    if (!course) return;
    setPurchasing(true);
    try {
      const res = await api.createCheckoutSession(course.id);
      if (res.checkout_url) {
        window.location.href = res.checkout_url;
      }
    } catch (err: any) {
      toast.error(`Stripe Checkout Error: ${err.message || 'Please log in to purchase.'}`);
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-center text-slate-900">
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
          <p className="text-sm font-bold text-slate-600">Loading course curriculum & video streams...</p>
        </div>
      </div>
    );
  }

  const displayCourse = course || mockDetail;

  const categoryName = typeof displayCourse.category === 'object' && displayCourse.category?.name
    ? displayCourse.category.name
    : (displayCourse.category_name || '');
  const fallbackHero = getFallbackThumbnail(categoryName, displayCourse.title);

  // Find preview lesson video if available
  const firstPreviewLesson = displayCourse.modules
    ?.flatMap((m) => m.lessons)
    .find((l) => l.is_preview || l.video_url);
  const defaultPreviewVideo = firstPreviewLesson?.video_url || 'https://www.w3schools.com/html/mov_bbb.mp4';

  if (displayCourse.is_enrolled) {
    return (
      <EnrolledCoursePlayer
        course={displayCourse}
        activeVideoUrl={activeVideoUrl}
        setActiveVideoUrl={setActiveVideoUrl}
        activeLessonTitle={activeLessonTitle}
        setActiveLessonTitle={setActiveLessonTitle}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col text-slate-900">

      {/* 1. TOP HERO SECTION (DARK MODERN DESIGN SYSTEM) */}
      <section className="relative bg-slate-950 text-white border-b border-slate-800 pt-10 pb-20 overflow-hidden">
        
        {/* Subtle Ambient Background Overlay */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src={heroImgSrc}
            alt=""
            onError={() => setHeroImgSrc(fallbackHero)}
            className="w-full h-full object-cover opacity-20 filter blur-xl scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-900/80" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/50 to-slate-950" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Left Col: Course Info (7 cols) */}
            <div className="lg:col-span-7 space-y-5">
              
              {/* Category Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 text-indigo-300 text-[10px] uppercase tracking-wider font-black border border-indigo-500/20 shadow-sm backdrop-blur-md">
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                <span>{typeof displayCourse.category === 'object' && displayCourse.category?.name ? displayCourse.category.name : (displayCourse.category_name || 'Technology Track')}</span>
              </div>

              {/* Course Title */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight drop-shadow-md">
                {displayCourse.title}
              </h1>

              {/* Course Description */}
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-medium max-w-2xl">
                {displayCourse.description}
              </p>

              {/* Ratings & Enrolled Count */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 font-bold pt-1">
                <div className="flex items-center space-x-1 text-amber-400">
                  <Star className="w-4 h-4 fill-amber-400 drop-shadow-sm" />
                  <span className="font-black text-white text-sm">4.9</span>
                  <span className="text-slate-400 font-medium">(1,240 ratings)</span>
                </div>
                <span className="text-slate-600">•</span>
                <span className="text-white">{displayCourse.enrollment_count || 1500}+ Learners Enrolled</span>
                <span className="text-slate-600">•</span>
                <span className="capitalize px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[10px] tracking-wider font-black">
                  {displayCourse.level} Level
                </span>
              </div>

              {/* Instructor Bio Badge */}
              <div className="pt-4 flex items-center space-x-3 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-sm max-w-md">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 text-slate-900 font-black flex items-center justify-center text-sm shadow-inner">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">
                    Instructor: {displayCourse.mentor?.username || 'Senior Technical Mentor'}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wide mt-0.5">Lead Software Engineer & Educator</p>
                </div>
              </div>

              {/* Feature Highlights List */}
              <div className="pt-4 grid grid-cols-2 gap-4 text-xs text-slate-300 font-bold max-w-lg">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center"><CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" /></div>
                  <span>Stripe Instant Unlocked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center"><CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" /></div>
                  <span>Adaptive Video Stream</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center"><CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" /></div>
                  <span>Verified Skill Certificate</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center"><CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" /></div>
                  <span>Lifetime Project Access</span>
                </div>
              </div>

            </div>

            {/* Right Col: Video Media Player & Pricing Card (5 cols) */}
            <div className="lg:col-span-5" ref={playerRef}>
              <div className="bg-white rounded-[2rem] border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden relative">
                
                {/* VIDEO PLAYER / THUMBNAIL CONTAINER */}
                <div className="relative aspect-video w-full bg-slate-950 flex items-center justify-center overflow-hidden">
                  {activeVideoUrl ? (
                    <div className="relative w-full h-full bg-black">
                      {activeVideoUrl.includes('drive.google.com') || activeVideoUrl.includes('youtube.com/embed') ? (
                        <iframe 
                          src={activeVideoUrl} 
                          className="w-full h-full border-0" 
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <ReactPlayer
                          src={activeVideoUrl}
                          controls
                          playing
                          width="100%"
                          height="100%"
                          onError={(e) => console.log('Player Error:', e)}
                          controlsList="nodownload"
                        />
                      )}
                      <button
                        onClick={() => {
                          setActiveVideoUrl(null);
                          setActiveLessonTitle(null);
                        }}
                        className="absolute top-2 right-2 bg-slate-900/80 hover:bg-slate-900 text-white p-2 rounded-full border border-slate-700 transition-colors z-10 backdrop-blur-sm"
                        title="Close Video"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {activeLessonTitle && (
                        <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-sm text-amber-400 px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider font-black border border-slate-700/50">
                          Playing: {activeLessonTitle}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="relative w-full h-full group cursor-pointer" onClick={() => handlePlayLessonVideo(firstPreviewLesson || { id: 0, title: 'Course Preview', duration: 10, order: 1, is_preview: true, video_url: defaultPreviewVideo })}>
                      <img
                        src={heroImgSrc}
                        alt={displayCourse.title}
                        onError={() => setHeroImgSrc(fallbackHero)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />

                      {/* Dark Overlay with Play Button */}
                      <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-slate-950/20 transition-colors duration-500 flex flex-col items-center justify-center p-4">
                        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:bg-amber-400 group-hover:text-slate-950 group-hover:border-amber-300 transition-all duration-500">
                          <PlayCircle className="w-8 h-8 fill-current drop-shadow-sm" />
                        </div>
                        <span className="mt-4 px-4 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[10px] uppercase tracking-widest font-black border border-white/10 shadow-lg">
                          Watch Free Preview
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* PRICING & ACTION DETAILS */}
                <div className="p-7 sm:p-8 space-y-7 bg-white text-slate-900">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">Enrolling Price</span>
                      <div className="text-3xl sm:text-4xl font-black text-slate-900">
                        {Number(displayCourse.price) === 0 ? 'Free' : `$${displayCourse.price}`}
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-black">
                      Lifetime Access
                    </span>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={handleCheckout}
                      disabled={purchasing}
                      className="w-full py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {purchasing ? (
                        <Loader2 className="w-5 h-5 animate-spin text-slate-950" />
                      ) : (
                        <>
                          <Zap className="w-5 h-5 fill-slate-950 text-slate-950" />
                          <span>Enroll Now with Stripe</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setIsAIChatOpen(true)}
                      className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-extrabold flex items-center justify-center gap-2 transition-all"
                    >
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      <span>Ask AI Advisor if this fits your career</span>
                    </button>
                  </div>

                  <div className="pt-4 border-t border-slate-200 space-y-2.5 text-xs text-slate-700 font-bold">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-indigo-600" /> Total Duration:
                      </span>
                      <span className="text-slate-900">25+ Hours HD Video</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-indigo-600" /> Total Modules:
                      </span>
                      <span className="text-slate-900">{displayCourse.modules?.length || 2} Modules</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-emerald-600" /> Certificate:
                      </span>
                      <span className="text-emerald-700 font-black">Included</span>
                    </div>
                  </div>

                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. MAIN COURSE BODY SECTIONS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16 flex-1">
        
        {/* SECTION 1: WHAT YOU WILL LEARN ("এই কোর্সে আপনি যা শিখবেন") */}
        <section className="bg-slate-50 rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-300">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900">What You Will Learn</h2>
              <p className="text-xs text-slate-600 font-medium">Core technical competencies and hands-on skills gained from this course.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              'Build real-world production projects using industry best practices.',
              'Master core frameworks, architecture patterns, and database modeling.',
              'Implement secure authentication, RESTful APIs, and cloud deployments.',
              'Learn debugging, automated testing, and performance optimization.',
              'Gain hands-on experience with modern tooling and version control (Git).',
              'Prepare for technical engineering interviews and build a portfolio.',
            ].map((skill, idx) => (
              <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200 flex items-start space-x-3 shadow-xs">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-xs font-bold text-slate-800 leading-relaxed">{skill}</span>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 2: COURSE CURRICULUM & ACCORDION */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2">
                <BookOpen className="w-7 h-7 text-indigo-600" />
                <span>Course Content & Modules</span>
              </h2>
              <p className="text-xs text-slate-600 font-medium mt-1">
                Click any preview lesson below to stream its video in the player.
              </p>
            </div>
            
            <div className="text-xs font-bold text-slate-600 bg-slate-100 px-4 py-2 rounded-xl border border-slate-200">
              {displayCourse.modules?.length || 0} Modules • {displayCourse.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0} Lessons
            </div>
          </div>

          {/* Module Cards Accordion */}
          <div className="space-y-4">
            {displayCourse.modules && displayCourse.modules.length > 0 ? (
              displayCourse.modules.map((module) => {
                const isOpen = openModuleIds.includes(module.id);
                return (
                  <div key={module.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    
                    {/* Module Header Button */}
                    <button
                      onClick={() => toggleModule(module.id)}
                      className="w-full p-5 bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between text-left font-black text-slate-900 border-b border-slate-200"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white text-xs font-black flex items-center justify-center shrink-0">
                          {module.order}
                        </span>
                        <span className="text-base sm:text-lg font-black text-slate-900">{module.title}</span>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <span className="text-xs text-slate-500 font-bold hidden sm:inline-block">
                          {module.lessons?.length || 0} Lessons
                        </span>
                        {isOpen ? <ChevronUp className="w-5 h-5 text-slate-600" /> : <ChevronDown className="w-5 h-5 text-slate-600" />}
                      </div>
                    </button>

                    {/* Lessons List */}
                    {isOpen && (
                      <div className="p-4 space-y-2 bg-white">
                        {module.lessons && module.lessons.length > 0 ? (
                          module.lessons.map((lesson) => (
                            <div
                              key={lesson.id}
                              className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-indigo-300 transition-colors"
                            >
                              <div className="flex items-center space-x-3">
                                {lesson.is_preview || lesson.video_url ? (
                                  <PlayCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                                ) : (
                                  <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                                )}
                                <div>
                                  <p className="text-xs font-black text-slate-900">{lesson.title}</p>
                                  <p className="text-[11px] text-slate-500 font-semibold">{lesson.duration} minutes</p>
                                </div>
                              </div>

                              <div className="flex items-center space-x-2 shrink-0">
                                {lesson.is_preview ? (
                                  <button
                                    onClick={() => handlePlayLessonVideo(lesson)}
                                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 transition-colors shadow-xs"
                                  >
                                    <PlayCircle className="w-3.5 h-3.5" />
                                    <span>Play Preview Video</span>
                                  </button>
                                ) : (
                                  <span className="px-2.5 py-1 rounded-md bg-slate-200 text-slate-600 text-[11px] font-bold flex items-center gap-1">
                                    <Lock className="w-3 h-3" />
                                    <span>Enrolled Only</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-slate-500 italic p-2">Lessons loaded upon enrollment.</p>
                        )}
                      </div>
                    )}

                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
                <p className="text-sm text-slate-600 font-medium">Curriculum modules are loaded directly from the database.</p>
              </div>
            )}
          </div>
        </section>

        {/* SECTION 3: INSTRUCTOR DETAILS */}
        <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <User className="w-6 h-6 text-indigo-600" />
            <span>Meet Your Instructor</span>
          </h2>

          <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="w-20 h-20 rounded-2xl bg-amber-400 text-slate-950 font-black text-2xl flex items-center justify-center shrink-0 shadow-md">
              {displayCourse.mentor?.username?.charAt(0).toUpperCase() || 'M'}
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-black text-slate-900">
                {displayCourse.mentor?.username || 'Senior Software Engineer & Lead Instructor'}
              </h3>
              <p className="text-xs text-indigo-600 font-extrabold uppercase tracking-wider">
                Senior Technical Mentor @ SkillPilot AI
              </p>
              <p className="text-xs text-slate-600 font-medium leading-relaxed max-w-2xl">
                With over 8+ years of production software engineering experience, our lead instructors guide students step-by-step through industry-grade architectures, real-world project builds, and career guidance.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 4: CERTIFICATION BANNER */}
        <section className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-lg">
          <div className="space-y-3 max-w-xl">
            <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black">
              🏆 SKILLPILOT VERIFIED CERTIFICATE
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              Earn Your Official Certificate
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              Upon completing all course modules and projects, receive a cryptographically verified SkillPilot completion certificate to showcase on LinkedIn and your resume.
            </p>
          </div>

          <div className="w-48 h-36 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-4 flex flex-col justify-between shrink-0 text-amber-400">
            <Award className="w-10 h-10 text-amber-400" />
            <div>
              <p className="text-xs font-black text-white">SkillPilot Certificate</p>
              <p className="text-[10px] text-slate-300 font-semibold">Verified Capstone 2026</p>
            </div>
          </div>
        </section>

      </div>

      <AIChatWidget isOpen={isAIChatOpen} onClose={() => setIsAIChatOpen(false)} />
    </div>
  );
}

const mockDetail: CourseDetail = {
  id: 1,
  title: 'Full Stack Django & React Masterclass',
  slug: 'full-stack-django-react',
  description: 'Complete step-by-step masterclass building real-world web applications with Django REST Framework, JWT authentication, and modern React.',
  price: '49.99',
  level: 'beginner',
  is_published: true,
  category_name: 'Backend Development',
  thumbnail: null,
  mentor: { id: 1, username: 'tanvir_mentor', email: 'tanvir@skillpilot.com', role: 'mentor' },
  modules: [
    {
      id: 101,
      title: 'Module 1: System Setup & Django Architecture',
      order: 1,
      lessons: [
        { id: 1, title: 'Lesson 1: Course Architecture & Overview', duration: 12, order: 1, is_preview: true, video_url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
        { id: 2, title: 'Lesson 2: Virtual Environment & DRF Serializers', duration: 25, order: 2, is_preview: false },
      ],
    },
    {
      id: 102,
      title: 'Module 2: Stripe Checkout & Google Gemini AI Integration',
      order: 2,
      lessons: [
        { id: 3, title: 'Lesson 3: Creating Stripe Checkout Sessions', duration: 30, order: 1, is_preview: true, video_url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
        { id: 4, title: 'Lesson 4: Webhook Listener & Enrollment Automation', duration: 35, order: 2, is_preview: false },
      ],
    },
  ],
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
