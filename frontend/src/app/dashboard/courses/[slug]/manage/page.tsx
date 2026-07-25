'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { CourseDetail, Module, Lesson } from '@/types';
import { ArrowLeft, Plus, Edit2, Trash2, Layout, Video, FileText, CheckCircle, Save, Loader2, PlayCircle, ToggleLeft, ToggleRight, BookOpen, Lock, X } from 'lucide-react';
import Link from 'next/link';

export default function CourseManagementPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeModule, setActiveModule] = useState<Module | null>(null);

  // Modals state
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  
  // Forms state
  const [moduleForm, setModuleForm] = useState({ id: 0, title: '', order: 1 });
  const [lessonForm, setLessonForm] = useState({ id: 0, title: '', video_url: '', duration: 0, order: 1, is_preview: false, module_id: 0 });

  const [submitting, setSubmitting] = useState(false);

  const loadCourse = async () => {
    try {
      const data = await api.getCourseDetail(slug);
      setCourse(data);
      if (data.modules && data.modules.length > 0) {
        // If activeModule is already selected, update it with new data
        if (activeModule) {
          const updated = data.modules.find(m => m.id === activeModule.id);
          setActiveModule(updated || data.modules[0]);
        } else {
          setActiveModule(data.modules[0]);
        }
      } else {
          setActiveModule(null);
      }
    } catch (err) {
      console.error('Error fetching course:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) {
      loadCourse();
    }
  }, [slug]);

  // --- Module Actions ---
  const handleOpenModuleModal = (mod?: Module) => {
    if (mod) {
      setModuleForm({ id: mod.id, title: mod.title, order: mod.order });
    } else {
      const nextOrder = course?.modules?.length ? Math.max(...course.modules.map(m => m.order)) + 1 : 1;
      setModuleForm({ id: 0, title: '', order: nextOrder });
    }
    setIsModuleModalOpen(true);
  };

  const handleSaveModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course) return;
    setSubmitting(true);
    try {
      if (moduleForm.id) {
        await api.updateModule(moduleForm.id, { title: moduleForm.title, order: moduleForm.order });
      } else {
        await api.createModule({ course: course.id, title: moduleForm.title, order: moduleForm.order });
      }
      setIsModuleModalOpen(false);
      await loadCourse();
    } catch (err: any) {
      toast.error(err.message || 'Error saving module');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteModule = async (id: number) => {
    if (!confirm('Are you sure you want to delete this module and ALL its lessons?')) return;
    try {
      await api.deleteModule(id);
      if (activeModule?.id === id) setActiveModule(null);
      await loadCourse();
    } catch (err: any) {
      toast.error(err.message || 'Error deleting module');
    }
  };

  // --- Lesson Actions ---
  const handleOpenLessonModal = (moduleId: number, lesson?: Lesson) => {
    if (lesson) {
      setLessonForm({ 
        id: lesson.id, 
        title: lesson.title, 
        video_url: lesson.raw_video_url || lesson.video_url || '', 
        duration: lesson.duration, 
        order: lesson.order, 
        is_preview: lesson.is_preview,
        module_id: moduleId
      });
    } else {
      const targetMod = course?.modules?.find(m => m.id === moduleId);
      const nextOrder = targetMod?.lessons?.length ? Math.max(...targetMod.lessons.map(l => l.order)) + 1 : 1;
      setLessonForm({ 
        id: 0, 
        title: '', 
        video_url: '', 
        duration: 0, 
        order: nextOrder, 
        is_preview: false,
        module_id: moduleId
      });
    }
    setIsLessonModalOpen(true);
  };

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        title: lessonForm.title,
        video_url: lessonForm.video_url,
        duration: lessonForm.duration,
        order: lessonForm.order,
        is_preview: lessonForm.is_preview,
        module: lessonForm.module_id
      };
      
      if (lessonForm.id) {
        await api.updateLesson(lessonForm.id, payload);
      } else {
        await api.createLesson(payload);
      }
      setIsLessonModalOpen(false);
      await loadCourse();
    } catch (err: any) {
      toast.error(err.message || 'Error saving lesson');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLesson = async (id: number) => {
    if (!confirm('Are you sure you want to delete this lesson?')) return;
    try {
      await api.deleteLesson(id);
      await loadCourse();
    } catch (err: any) {
      toast.error(err.message || 'Error deleting lesson');
    }
  };

  const handleToggleFinalized = async () => {
    if (!course) return;
    try {
      const newStatus = !course.is_completed_by_mentor;
      await api.updateCourse(course.slug, { is_completed_by_mentor: newStatus });
      setCourse({ ...course, is_completed_by_mentor: newStatus });
    } catch (err: any) {
      alert(err.message || 'Error updating course status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-20">
        <h3 className="text-xl font-bold text-slate-800">Course not found.</h3>
        <button onClick={() => router.back()} className="mt-4 text-indigo-600 font-bold hover:underline">Go Back</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link href="/dashboard/courses" className="text-indigo-600 text-xs font-bold flex items-center gap-1 mb-2 hover:underline w-max">
            <ArrowLeft className="w-3 h-3" /> Back to My Courses
          </Link>
          <h1 className="text-3xl font-black text-slate-900 leading-tight">
            Manage Content
          </h1>
          <p className="text-xs font-bold text-slate-500 mt-1">
            {course.title}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleFinalized}
            className={`px-4 py-2.5 rounded-xl text-xs font-black shadow-sm transition-colors flex items-center gap-2 ${
              course.is_completed_by_mentor 
                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border border-emerald-200' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            {course.is_completed_by_mentor ? (
              <>
                <ToggleRight className="w-5 h-5 text-emerald-600" />
                <span>Course Finalized</span>
              </>
            ) : (
              <>
                <ToggleLeft className="w-5 h-5 text-slate-400" />
                <span>Mark as Finalized</span>
              </>
            )}
          </button>
          
          <button 
            onClick={() => handleOpenModuleModal()}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black shadow-sm transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Module</span>
          </button>
        </div>
      </div>

      {/* Main Layout: Sidebar (Modules) & Main (Lessons) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Sidebar: Modules List */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Layout className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-black text-slate-900">Curriculum Modules</h2>
            </div>
            
            {course.modules && course.modules.length > 0 ? (
              <div className="space-y-2">
                {course.modules.map(mod => (
                  <div 
                    key={mod.id} 
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${activeModule?.id === mod.id ? 'border-indigo-600 bg-indigo-50/50 shadow-xs' : 'border-slate-200 hover:border-slate-300 bg-slate-50'}`}
                    onClick={() => setActiveModule(mod)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3 truncate">
                        <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 text-[10px] font-black flex items-center justify-center">
                          {mod.order}
                        </span>
                        <span className="text-sm font-bold text-slate-800 truncate">{mod.title}</span>
                      </div>
                    </div>
                    
                    {/* Module Actions */}
                    <div className="flex items-center gap-2 mt-3 justify-end border-t border-slate-200/50 pt-2">
                      <span className="text-[10px] font-bold text-slate-500 mr-auto">{mod.lessons?.length || 0} Lessons</span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleOpenModuleModal(mod); }}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Edit Module"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteModule(mod.id); }}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Module"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
                <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-bold">No modules yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Area: Lessons List */}
        <div className="lg:col-span-8">
          {activeModule ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-black text-slate-900">{activeModule.title}</h2>
                  <p className="text-xs font-bold text-slate-500 mt-1">Manage lessons for this module.</p>
                </div>
                <button 
                  onClick={() => handleOpenLessonModal(activeModule.id)}
                  className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-black transition-colors flex items-center gap-2 w-max"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Lesson</span>
                </button>
              </div>

              {activeModule.lessons && activeModule.lessons.length > 0 ? (
                <div className="space-y-3">
                  {activeModule.lessons.map(lesson => (
                    <div key={lesson.id} className="group p-4 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-xs transition-all bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      
                      <div className="flex items-start gap-4">
                        <div className="mt-0.5 shrink-0">
                          {lesson.is_preview ? (
                            <PlayCircle className="w-5 h-5 text-emerald-500" />
                          ) : (
                            <Lock className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                              #{lesson.order}
                            </span>
                            <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">{lesson.title}</h4>
                          </div>
                          
                          <div className="flex items-center gap-3 mt-1.5 text-[11px] font-bold text-slate-500">
                            <span className="flex items-center gap-1">
                              <Video className="w-3 h-3 text-slate-400" />
                              {lesson.duration} mins
                            </span>
                            {lesson.is_preview && (
                              <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                Free Preview
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button 
                          onClick={() => handleOpenLessonModal(activeModule.id, lesson)}
                          className="px-3 py-1.5 text-[11px] font-black text-slate-600 bg-white border border-slate-200 rounded-lg hover:text-indigo-600 hover:border-indigo-200 transition-colors shadow-xs"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteLesson(lesson.id)}
                          className="px-3 py-1.5 text-[11px] font-black text-slate-600 bg-white border border-slate-200 rounded-lg hover:text-red-600 hover:border-red-200 transition-colors shadow-xs"
                        >
                          Delete
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
                  <Video className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <h4 className="text-sm font-bold text-slate-800">No lessons in this module</h4>
                  <p className="text-xs text-slate-500 font-medium mt-1 mb-4">Add video lessons to start building your curriculum.</p>
                  <button 
                    onClick={() => handleOpenLessonModal(activeModule.id)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-md transition-all inline-flex items-center gap-2"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create First Lesson</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-3xl p-10 shadow-sm text-center h-full flex flex-col items-center justify-center min-h-[400px]">
              <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                <Layout className="w-8 h-8 text-indigo-300" />
              </div>
              <h3 className="text-lg font-black text-slate-800">Select a Module</h3>
              <p className="text-xs text-slate-500 font-bold mt-2 max-w-sm mx-auto">
                Click on a module from the sidebar to manage its lessons, or create a new module to get started.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* --- Modals --- */}
      {/* Module Modal */}
      {isModuleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-slideUp">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-black text-slate-900">{moduleForm.id ? 'Edit Module' : 'Create Module'}</h3>
              <button onClick={() => setIsModuleModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveModule} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1.5 uppercase tracking-wider">Module Title</label>
                <input 
                  type="text"
                  required
                  value={moduleForm.title}
                  onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-sm font-semibold transition-all bg-slate-50 focus:bg-white"
                  placeholder="e.g. Introduction to React"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1.5 uppercase tracking-wider">Order Position</label>
                <input 
                  type="number"
                  min="1"
                  required
                  value={moduleForm.order}
                  onChange={(e) => setModuleForm({ ...moduleForm, order: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-sm font-semibold transition-all bg-slate-50 focus:bg-white"
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModuleModalOpen(false)} className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="px-5 py-2.5 rounded-xl text-xs font-black text-white bg-slate-900 hover:bg-slate-800 shadow-md transition-all flex items-center gap-2">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Save Module</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lesson Modal */}
      {isLessonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-slideUp">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-black text-slate-900">{lessonForm.id ? 'Edit Lesson' : 'Create Lesson'}</h3>
              <button onClick={() => setIsLessonModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveLesson} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1.5 uppercase tracking-wider">Lesson Title</label>
                <input 
                  type="text"
                  required
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-sm font-semibold transition-all bg-slate-50 focus:bg-white"
                  placeholder="e.g. Setting up your environment"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1.5 uppercase tracking-wider">Video URL (Google Drive/Direct Link)</label>
                <input 
                  type="url"
                  value={lessonForm.video_url}
                  onChange={(e) => setLessonForm({ ...lessonForm, video_url: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-sm font-semibold transition-all bg-slate-50 focus:bg-white"
                  placeholder="https://..."
                />
                <p className="text-[10px] text-slate-500 font-bold mt-1.5">Leave blank if this is a text-only lesson.</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1.5 uppercase tracking-wider">Duration (mins)</label>
                  <input 
                    type="number"
                    min="0"
                    required
                    value={lessonForm.duration}
                    onChange={(e) => setLessonForm({ ...lessonForm, duration: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-sm font-semibold transition-all bg-slate-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1.5 uppercase tracking-wider">Order Position</label>
                  <input 
                    type="number"
                    min="1"
                    required
                    value={lessonForm.order}
                    onChange={(e) => setLessonForm({ ...lessonForm, order: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-sm font-semibold transition-all bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl bg-slate-50 cursor-pointer hover:border-indigo-300 transition-colors">
                  <input 
                    type="checkbox"
                    checked={lessonForm.is_preview}
                    onChange={(e) => setLessonForm({ ...lessonForm, is_preview: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                  />
                  <div>
                    <p className="text-sm font-black text-slate-900">Make this a Free Preview</p>
                    <p className="text-xs text-slate-500 font-bold">Unregistered users can watch this lesson.</p>
                  </div>
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsLessonModalOpen(false)} className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="px-5 py-2.5 rounded-xl text-xs font-black text-white bg-slate-900 hover:bg-slate-800 shadow-md transition-all flex items-center gap-2">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Save Lesson</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
