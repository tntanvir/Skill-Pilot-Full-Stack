'use client';

import { useState, useEffect } from 'react';
import Hero from '@/components/Hero';
import TopPromoStrip from '@/components/TopPromoStrip';
import CategoryTabs from '@/components/CategoryTabs';
import FeaturedDarkSection from '@/components/FeaturedDarkSection';
import BusinessBanner from '@/components/BusinessBanner';
import PlatformHighlights from '@/components/PlatformHighlights';
import StatCards from '@/components/StatCards';
import TestimonialGrid from '@/components/TestimonialGrid';
import AppDownloadBanner from '@/components/AppDownloadBanner';
import { api } from '@/lib/api';
import { Course } from '@/types';

export default function HomePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCourses() {
      try {
        const data = await api.getCourses(1);
        if (data && data.results && Array.isArray(data.results)) {
          setCourses(data.results);
        }
      } catch (err) {
        console.warn('Backend API error loading courses:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCourses();
  }, []);

  const handleHeroSearchSubmit = (prompt: string) => {
    // We can dispatch a custom event to open the chat widget in AppShell if needed, 
    // or we can remove the AI prompt handling from Hero since the Navbar does it globally.
    // For now, we will dispatch an event that AppShell can listen to.
    window.dispatchEvent(new CustomEvent('open-ai-chat', { detail: { prompt } }));
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between text-slate-900">
      
      {/* 1. Top Promo Strip */}
      <Hero onSearchSubmit={handleHeroSearchSubmit} latestCourse={courses.length > 0 ? courses[0] : undefined} />

      {/* 3. Top Marquee Promo Strip */}
      <TopPromoStrip />

      {/* 4. Category Tabs Live Batches */}
      <CategoryTabs courses={courses} loading={loading} />

      {/* 5. Trending Dark Grid Section */}
      <FeaturedDarkSection courses={courses} loading={loading} />

      {/* 6. Enterprise / Business Banner */}
      <BusinessBanner />

      {/* 7. Platform Highlights (6 Features) */}
      <PlatformHighlights />

      {/* 8. Metric Stat Cards */}
      <StatCards />

      {/* 9. Testimonials Grid */}
      <TestimonialGrid />

      {/* 10. Mobile App Download */}
      <AppDownloadBanner />

    </div>
  );
}
