export interface PaginatedResponse<T> {
  count: number;
  total_pages: number;
  current_page: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  course_count?: number;
}

export interface User {
  id: number;
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  address?: string;
  role: 'student' | 'mentor' | 'admin';
  bio?: string;
  profile_picture?: string;
  is_email_verified?: boolean;
}

export interface Course {
  id: number;
  title: string;
  slug: string;
  description: string;
  price: string | number;
  level: 'beginner' | 'intermediate' | 'advanced';
  is_published: boolean;
  is_completed_by_mentor?: boolean;
  is_enrolled?: boolean;
  category_name?: string;
  category?: Category | number;
  mentor?: User;
  thumbnail?: string | null;
  enrollment_count?: number;
  created_at?: string;
}

export interface Lesson {
  id: number;
  title: string;
  video_url?: string;
  raw_video_url?: string;
  hls_playlist_url?: string;
  content?: string;
  duration: number;
  order: number;
  is_preview: boolean;
}

export interface Module {
  id: number;
  title: string;
  order: number;
  lessons: Lesson[];
}

export interface CourseDetail extends Course {
  modules: Module[];
  completed_lesson_ids?: number[];
  category?: Category;
  mentor?: User;
}

export interface ChatMessageResponse {
  id: number;
  session_id: string;
  user_message: string;
  bot_response: string;
  user_skills?: string;
  target_goal?: string;
  recommended_courses: Course[];
  created_at: string;
}

export interface WeeklyActivityItem {
  day: string;
  hours: number;
  height: string;
}

export interface LastActiveCourseInfo {
  id: number;
  title: string;
  slug: string;
  category_name?: string;
  thumbnail?: string | null;
  current_module_title?: string;
  completion_percentage?: number;
}

export interface DashboardStats {
  enrolled_courses_count?: number;
  active_this_month?: number;
  learning_hours?: number;
  study_velocity?: string;
  lessons_completed?: number;
  average_score?: string;
  certificates_count?: number;
  weekly_activity?: WeeklyActivityItem[];
  monthly_activity?: WeeklyActivityItem[];
  last_active_course?: LastActiveCourseInfo | null;
  
  // Mentor fields
  role?: string;
  total_published_courses?: number;
  total_students_enrolled?: number;
  total_earnings?: number;
  weekly_earnings?: { day: string; amount: number; height: string }[];
  recent_courses?: { id: number; title: string; slug: string; created_at: string }[];
  recent_enrollments?: { student_name: string; course_title: string; date: string }[];
  recent_reviews?: { student_name: string; course_title: string; rating: number; comment: string; date: string }[];
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  confirm_password: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  address?: string;
  role?: 'student' | 'mentor' | 'admin';
  bio?: string;
}

export interface VerifyOTPPayload {
  email: string;
  otp: string;
  purpose: 'registration' | 'reset_password';
}

export interface ResendOTPPayload {
  email: string;
  purpose: 'registration' | 'reset_password';
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user: User;
  tokens: {
    refresh: string;
    access: string;
  };
}

export interface PaymentRecord {
  id: number;
  user: number;
  course: number;
  course_title?: string;
  amount: string | number;
  currency: string;
  stripe_checkout_session_id?: string;
  stripe_payment_intent_id?: string;
  status: string;
  created_at: string;
}

export interface ChangePasswordPayload {
  old_password?: string;
  new_password?: string;
  confirm_password?: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  new_password?: string;
  confirm_password?: string;
}

export interface CreateCoursePayload {
  title: string;
  description: string;
  price: string | number;
  level: 'beginner' | 'intermediate' | 'advanced';
  category_id?: number;
  thumbnail?: string;
}

export interface CourseReview {
  id: number;
  course: number;
  course_title?: string;
  student: number;
  student_name?: string;
  rating: number;
  comment?: string;
  created_at: string;
}

export interface CourseReviewPayload {
  course: number;
  rating: number;
  comment?: string;
}
