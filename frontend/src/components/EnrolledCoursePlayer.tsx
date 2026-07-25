'use client';

import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { CourseDetail, Lesson, Module, User } from '@/types';
import { PlayCircle, CheckCircle2, Bookmark, AlertTriangle, Minus, ChevronDown, ChevronUp, Download, Mail, Award, X, MessageSquare } from 'lucide-react';
import { api } from '@/lib/api';
import Certificate from './Certificate';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import toast from 'react-hot-toast';

const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });

interface EnrolledCoursePlayerProps {
  course: CourseDetail;
  activeVideoUrl: string | null;
  setActiveVideoUrl: (url: string | null) => void;
  activeLessonTitle: string | null;
  setActiveLessonTitle: (title: string | null) => void;
}

export default function EnrolledCoursePlayer({
  course,
  activeVideoUrl,
  setActiveVideoUrl,
  activeLessonTitle,
  setActiveLessonTitle
}: EnrolledCoursePlayerProps) {
  const [openModuleIds, setOpenModuleIds] = useState<number[]>([]);
  const [completedLessonIds, setCompletedLessonIds] = useState<number[]>(course.completed_lesson_ids || []);
  const [activeLessonId, setActiveLessonId] = useState<number | null>(null);
  const [showCertificate, setShowCertificate] = useState(false);
  const [studentName, setStudentName] = useState('SkillPilot Learner');
  const [emailing, setEmailing] = useState(false);
  
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    // Attempt to get user name
    api.getProfile().then(user => {
      if (user) {
        setCurrentUser(user);
        if (user.first_name || user.last_name) {
          setStudentName(`${user.first_name} ${user.last_name}`.trim());
        } else if (user.username) {
          setStudentName(user.username);
        }
      }
    }).catch(e => console.log('Could not fetch user profile for cert'));
  }, []);

  // Initialize first module and lesson
  useEffect(() => {
    if (course.modules && course.modules.length > 0) {
      setOpenModuleIds([course.modules[0].id]);
      const firstLesson = course.modules[0].lessons?.[0];
      if (firstLesson && !activeVideoUrl) {
        setActiveVideoUrl(firstLesson.video_url || null);
        setActiveLessonTitle(firstLesson.title);
        setActiveLessonId(firstLesson.id);
      }
    }
  }, [course]);

  const toggleModule = (id: number) => {
    setOpenModuleIds((prev) =>
      prev.includes(id) ? prev.filter((mId) => mId !== id) : [...prev, id]
    );
  };

  const playLesson = (lesson: Lesson) => {
    setActiveVideoUrl(lesson.video_url || null);
    setActiveLessonTitle(lesson.title);
    setActiveLessonId(lesson.id);
  };

  const markLessonComplete = async (lessonId: number) => {
    if (completedLessonIds.includes(lessonId)) return;
    try {
      await api.completeLesson(course.slug, lessonId);
      setCompletedLessonIds((prev) => [...prev, lessonId]);
    } catch (err) {
      console.error('Failed to complete lesson:', err);
    }
  };

  const handleNext = async () => {
    if (!activeLessonId) return;
    
    // Mark current as complete
    await markLessonComplete(activeLessonId);

    // Find next lesson
    let foundCurrent = false;
    let nextLesson: Lesson | null = null;
    let nextModuleId: number | null = null;

    for (const module of course.modules) {
      for (const lesson of module.lessons || []) {
        if (foundCurrent) {
          nextLesson = lesson;
          nextModuleId = module.id;
          break;
        }
        if (lesson.id === activeLessonId) {
          foundCurrent = true;
        }
      }
      if (nextLesson) break;
    }

    if (nextLesson) {
      playLesson(nextLesson);
      if (nextModuleId && !openModuleIds.includes(nextModuleId)) {
        setOpenModuleIds((prev) => [...prev, nextModuleId!]);
      }
    }
  };

  const allLessons = course.modules.flatMap(m => m.lessons || []);
  const totalLessons = allLessons.length;
  const progressPercent = totalLessons === 0 ? 0 : Math.round((completedLessonIds.length / totalLessons) * 100);
  const isCourseFullyCompleted = progressPercent === 100 && !!course.is_completed_by_mentor;

  const downloadCertificate = async () => {
    const certElement = document.getElementById('certificate-container');
    if (!certElement) return;

    try {
      const dataUrl = await toPng(certElement, { cacheBust: true, pixelRatio: 2 });
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [900, 630]
      });
      pdf.addImage(dataUrl, 'PNG', 0, 0, 900, 630);
      pdf.save(`${course.slug}-certificate.pdf`);
    } catch (err) {
      console.error('Error generating PDF', err);
    }
  };

  const emailCertificate = async () => {
    const certElement = document.getElementById('certificate-container');
    if (!certElement) return;

    try {
      setEmailing(true);
      const dataUrl = await toPng(certElement, { cacheBust: true, pixelRatio: 2 });
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [900, 630]
      });
      pdf.addImage(dataUrl, 'PNG', 0, 0, 900, 630);
      // Get base64 string without the data URI prefix
      const base64Pdf = pdf.output('datauristring').split(',')[1];
      
      await api.emailCertificate(course.slug, base64Pdf);
      toast.success('Certificate has been sent to your email!');
    } catch (err: any) {
      console.error('Error emailing certificate', err);
      toast.error(`Failed to send email: ${err.message || 'Unknown error'}`);
    } finally {
      setEmailing(false);
    }
  };

  const submitReview = async () => {
    try {
      setSubmittingReview(true);
      await api.createReview({
        course: course.id,
        rating,
        comment
      });
      toast.success('Thank you for your review!');
      setShowReviewModal(false);
    } catch (err: any) {
      toast.error(`Error submitting review: ${err.message}`);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleOpenReviewModal = async () => {
    setShowReviewModal(true);
    try {
      const reviews = await api.getReviews(course.slug);
      const myReview = reviews.find(r => r.student === currentUser?.id);
      if (myReview) {
        setRating(myReview.rating);
        setComment(myReview.comment || '');
      } else {
        setRating(5);
        setComment('');
      }
    } catch (e) {
      console.error('Could not fetch existing reviews', e);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 pt-8 pb-16">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-xl font-bold mb-4">{course.title}</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT: Video Player (8 cols) */}
          <div className="lg:col-span-8 flex flex-col space-y-4">
            
            {/* Player Box */}
            <div className="bg-black w-full aspect-video rounded-xl overflow-hidden relative shadow-lg">
              {activeVideoUrl ? (
                activeVideoUrl.includes('drive.google.com') || activeVideoUrl.includes('youtube.com/embed') ? (
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
                    onEnded={handleNext}
                    onError={(e) => console.log('Player Error:', e)}
                    controlsList="nodownload"
                  />
                )
              ) : (
                <div className="flex items-center justify-center w-full h-full text-white">
                  <p>No video available</p>
                </div>
              )}
            </div>

            {/* Video Controls / Title */}
            <div className="flex flex-col sm:flex-row items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">{activeLessonTitle || 'Select a lesson'}</h2>
              <div className="flex items-center gap-3 mt-3 sm:mt-0">
                <button 
                  onClick={handleNext}
                  className="px-6 py-2 bg-[#0052CC] hover:bg-[#0047b3] text-white font-bold rounded-full text-sm transition-colors"
                >
                  Next
                </button>
              </div>
            </div>

            {/* Copyright Warning */}
            <div className="flex items-center gap-2 text-[#E53E3E] text-xs font-semibold mt-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Copyright warning</span>
            </div>
            
          </div>

          {/* RIGHT: Course Content Sidebar (4 cols) */}
          <div className="lg:col-span-4 flex flex-col h-full max-h-[85vh] bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            
            {/* Header & Progress */}
            <div className="p-5 border-b border-slate-100 shrink-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900">Course Content</h3>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#38A169] transition-all duration-500" 
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-600">{progressPercent}%</span>
                </div>
              </div>
            </div>

            {/* Modules List */}
            <div className="overflow-y-auto flex-1">
              {course.modules.map((module) => {
                const isOpen = openModuleIds.includes(module.id);
                return (
                  <div key={module.id} className="border-b border-slate-100 last:border-0">
                    <button
                      onClick={() => toggleModule(module.id)}
                      className="w-full p-4 bg-white hover:bg-slate-50 transition-colors flex items-center justify-between text-left"
                    >
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{module.title}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {module.lessons?.length || 0} units
                        </p>
                      </div>
                      <div className="w-6 h-6 rounded bg-[#0052CC] text-white flex items-center justify-center shrink-0">
                        {isOpen ? <Minus className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </button>

                    {isOpen && (
                      <div className="bg-white">
                        {module.lessons?.map((lesson) => {
                          const isCompleted = completedLessonIds.includes(lesson.id);
                          const isActive = activeLessonId === lesson.id;
                          
                          return (
                            <div 
                              key={lesson.id}
                              onClick={() => playLesson(lesson)}
                              className={`p-3 pl-8 flex items-start gap-3 cursor-pointer transition-colors ${
                                isActive ? 'bg-blue-50 border-l-4 border-[#0052CC]' : 'hover:bg-slate-50 border-l-4 border-transparent'
                              }`}
                            >
                              <div className="mt-0.5 shrink-0">
                                {isCompleted ? (
                                  <CheckCircle2 className="w-4 h-4 text-[#38A169]" />
                                ) : isActive ? (
                                  <PlayCircle className="w-4 h-4 text-[#0052CC]" />
                                ) : (
                                  <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                                )}
                              </div>
                              <div>
                                <p className={`text-xs font-bold ${isActive ? 'text-[#0052CC]' : isCompleted ? 'text-slate-500' : 'text-slate-700'}`}>
                                  {lesson.title}
                                </p>
                                <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                                  <PlayCircle className="w-3 h-3" /> {lesson.duration} min
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Complete Course Button */}
            <div className="p-4 border-t border-slate-100 shrink-0 space-y-3">
              {progressPercent === 100 ? (
                <>
                  {course.is_completed_by_mentor ? (
                    <button 
                      onClick={() => setShowCertificate(true)}
                      className="w-full py-3 bg-[#38A169] hover:bg-[#2f855a] text-white font-bold rounded-lg text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Award className="w-5 h-5" /> Get Certificate
                    </button>
                  ) : (
                    <button 
                      disabled
                      className="w-full py-3 bg-slate-200 text-slate-500 font-bold rounded-lg text-sm cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      Waiting for Mentor Finalization
                    </button>
                  )}
                  <button
                    onClick={handleOpenReviewModal}
                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-300 text-slate-900 font-black text-sm flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-md"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Review Course
                  </button>
                </>
              ) : (
                <button 
                  disabled
                  className="w-full py-3 bg-slate-200 text-slate-500 font-bold rounded-lg text-sm cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Complete {totalLessons - completedLessonIds.length} more lessons for Certificate
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Ultra Simple Certificate Modal */}
      {showCertificate && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-start overflow-y-auto p-8 bg-slate-900/90 backdrop-blur-sm">
          
          {/* Close Button */}
          <button 
            onClick={() => setShowCertificate(false)}
            className="fixed top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-50"
          >
            <span className="text-xl">&times;</span>
          </button>

          <div className="flex flex-col items-center justify-center min-h-full py-12">
            {/* Certificate Container */}
            <div className="relative shadow-2xl bg-white rounded-sm mb-8">
              <Certificate 
                studentName={studentName}
                courseName={course.title}
                completionDate={new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                validationId={`SP-${course.id}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button 
                onClick={emailCertificate}
                disabled={emailing}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg text-sm transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Mail className="w-4 h-4" /> {emailing ? 'Sending...' : 'Email to Me'}
              </button>
              <button 
                onClick={downloadCertificate}
                className="px-6 py-3 bg-[#0052CC] hover:bg-[#0047b3] text-white font-bold rounded-lg text-sm transition-colors flex items-center gap-2 shadow-lg"
              >
                <Download className="w-4 h-4" /> Download PDF
              </button>
            </div>
          </div>

        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Review Course</h3>
              <button onClick={() => setShowReviewModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`text-2xl transition-colors ${rating >= star ? 'text-amber-400' : 'text-slate-300'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Comment</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
                placeholder="What did you think about this course?"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowReviewModal(false)}
                className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={submitReview}
                disabled={submittingReview}
                className="px-4 py-2 bg-[#0052CC] hover:bg-[#0047b3] text-white font-bold rounded-lg disabled:opacity-50"
              >
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
