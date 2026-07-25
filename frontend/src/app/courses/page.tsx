'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import CourseCard from '@/components/CourseCard';
import AIChatWidget from '@/components/AIChatWidget';
import { api } from '@/lib/api';
import { Course, Category } from '@/types';
import { Search, BookOpen } from 'lucide-react';

function CoursesContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams?.get('search') || '';

  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    async function loadInitialData() {
      try {
        const catData = await api.getCategories();
        if (catData && catData.length > 0) {
          setCategories(catData);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    }
    loadInitialData();
  }, []);

  useEffect(() => {
    async function loadCourses() {
      setLoading(true);
      try {
        const catFilter = selectedCategory === 'All' ? undefined : selectedCategory;
        const levelFilter = selectedLevel === 'All' ? undefined : selectedLevel.toLowerCase();
        const data = await api.getCourses(currentPage, searchQuery, catFilter, levelFilter);
        
        if (data && data.results && data.results.length > 0) {
          setCourses(data.results);
          setTotalPages(data.total_pages);
        } else {
          setCourses(currentPage === 1 && !searchQuery && selectedCategory === 'All' ? allCoursesFallback : []);
          setTotalPages(1);
        }
      } catch (err) {
        setCourses(currentPage === 1 ? allCoursesFallback : []);
      } finally {
        setLoading(false);
      }
    }
    
    // Add a slight debounce for search query
    const timeoutId = setTimeout(() => {
      loadCourses();
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [currentPage, searchQuery, selectedCategory, selectedLevel]);

  useEffect(() => {
    const q = searchParams?.get('search');
    if (q !== null && q !== undefined) {
      setSearchQuery(q);
      setCurrentPage(1);
    }
  }, [searchParams]);

  const categoryNames = ['All', ...categories.map(c => c.name)];

  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-900">

      {/* Header */}
      <div className="relative pt-16 pb-16 bg-slate-50 border-b border-slate-200/50 overflow-hidden">
        {/* Soft Background Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-gradient-to-r from-amber-200/40 via-indigo-300/30 to-amber-200/40 blur-[80px] pointer-events-none rounded-full" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-[10px] font-black text-indigo-600 tracking-[0.2em] uppercase shadow-sm">
            <BookOpen className="w-3.5 h-3.5" />
            SKILLPILOT CATALOG
          </span>
          <h1 className="mt-4 text-4xl sm:text-6xl font-black text-slate-900 tracking-tight">
            Explore All <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Courses</span>
          </h1>
          <p className="mt-4 text-sm sm:text-base text-slate-600 font-medium max-w-xl mx-auto leading-relaxed">
            Hands-on technical courses designed for modern developer and engineering careers.
          </p>

          {/* Search & Filter Bar */}
          <div className="mt-10 max-w-2xl mx-auto flex items-center bg-white border border-slate-200/80 rounded-[1.25rem] p-2.5 shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.1)] transition-shadow">
            <Search className="w-5 h-5 text-indigo-500 ml-3 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title or keyword (e.g. Python, Docker, Flutter...)"
              className="w-full bg-transparent text-slate-900 placeholder-slate-400 text-sm focus:outline-none px-4 font-semibold"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="mt-8 flex flex-wrap justify-center gap-2.5 max-w-3xl mx-auto">
            {categoryNames.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all duration-300 ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white shadow-md scale-105 ring-2 ring-slate-900/10'
                    : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200 hover:shadow-sm'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Course List Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-96 rounded-2xl bg-slate-100 border border-slate-200" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-3xl border border-slate-200">
            <BookOpen className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="mt-4 text-lg font-black text-slate-900">No courses match your query</h3>
            <p className="mt-1 text-xs text-slate-600 font-medium">Try adjusting your search terms or category filters.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((c) => (
                <CourseCard key={c.id} course={c} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => {
                    setCurrentPage((p) => Math.max(1, p - 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-4 py-2 rounded-xl text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-slate-100 text-slate-700 hover:bg-slate-200"
                >
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => {
                        setCurrentPage(p);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                        currentPage === p
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => {
                    setCurrentPage((p) => Math.min(totalPages, p + 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-4 py-2 rounded-xl text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-slate-100 text-slate-700 hover:bg-slate-200"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <AIChatWidget isOpen={isAIChatOpen} onClose={() => setIsAIChatOpen(false)} />
    </div>
  );
}

export default function CoursesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <CoursesContent />
    </Suspense>
  );
}

const allCoursesFallback: Course[] = [
  { id: 1, title: 'Flutter & Dart App Development', slug: 'flutter-dart-app-development', description: 'Build high-performance iOS and Android cross-platform mobile apps using Flutter and Dart framework.', price: '59.99', level: 'beginner', is_published: true, category_name: 'Mobile App Development' },
  { id: 2, title: 'Android App Development with Kotlin', slug: 'android-app-development-kotlin', description: 'Master native Android development using Kotlin, Jetpack Compose, MVVM architecture, and REST APIs.', price: '49.99', level: 'intermediate', is_published: true, category_name: 'Mobile App Development' },
  { id: 3, title: 'Docker & Kubernetes Mastery for DevOps', slug: 'docker-kubernetes-mastery-for-devops', description: 'Learn containerization with Docker, container orchestration with Kubernetes, CI/CD pipelines, and microservices.', price: '69.99', level: 'intermediate', is_published: true, category_name: 'DevOps & Cloud' },
  { id: 4, title: 'AWS Cloud Solutions Architect', slug: 'aws-cloud-solutions-architect', description: 'Comprehensive guide to Amazon Web Services (AWS), EC2, S3, Lambda, IAM, VPC, and cloud architecture.', price: '79.99', level: 'advanced', is_published: true, category_name: 'DevOps & Cloud' },
  { id: 5, title: 'Computer Networking & Cisco CCNA', slug: 'computer-networking-cisco-ccna', description: 'Fundamentals of TCP/IP networking, IP addressing, subnetting, routers, switches, and network security protocols.', price: '39.99', level: 'beginner', is_published: true, category_name: 'Networking & Security' },
  { id: 6, title: 'Cybersecurity & Ethical Hacking Bootcamp', slug: 'cybersecurity-ethical-hacking-bootcamp', description: 'Learn penetration testing, ethical hacking, network vulnerability assessment, cryptography, and defense.', price: '64.99', level: 'intermediate', is_published: true, category_name: 'Networking & Security' },
  { id: 7, title: 'Applied AI & Generative AI with Python', slug: 'applied-ai-generative-ai-python', description: 'Master Deep Learning, PyTorch, Large Language Models (LLMs), Prompt Engineering, and OpenAI/Gemini APIs.', price: '89.99', level: 'advanced', is_published: true, category_name: 'Artificial Intelligence' },
  { id: 8, title: 'Machine Learning & Data Science Bootcamp', slug: 'machine-learning-data-science-bootcamp', description: 'Practical Data Science using Python, Pandas, NumPy, Scikit-Learn, data visualization, and predictive modeling.', price: '54.99', level: 'beginner', is_published: true, category_name: 'Artificial Intelligence' },
  { id: 9, title: 'Node.js & Express API Development', slug: 'nodejs-express-api-development', description: 'Build high-performance RESTful APIs and real-time backend microservices using Node.js, Express, and MongoDB.', price: '45.00', level: 'beginner', is_published: true, category_name: 'Backend Development' },
  { id: 10, title: 'FastAPI & Async Python Microservices', slug: 'fastapi-async-python-microservices', description: 'Modern asynchronous API development using Python FastAPI, Pydantic, PostgreSQL, and Docker containerization.', price: '49.99', level: 'intermediate', is_published: true, category_name: 'Backend Development' },
];
