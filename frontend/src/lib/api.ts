import {
  Category,
  Course,
  CourseDetail,
  ChatMessageResponse,
  RegisterPayload,
  VerifyOTPPayload,
  ResendOTPPayload,
  LoginPayload,
  LoginResponse,
  ChangePasswordPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  CreateCoursePayload,
  PaymentRecord,
  User,
  DashboardStats,
  PaginatedResponse,
  CourseReview,
  CourseReviewPayload,
} from '@/types';

export interface EnrollmentRecord {
  id: number;
  student: number;
  student_email?: string;
  student_name?: string;
  course: number;
  course_title?: string;
  enrolled_at: string;
  is_completed: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

// Helper for HTTP requests with token injection and error handling
async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('access_token') : null;
  const headers: HeadersInit = {
    'ngrok-skip-browser-warning': 'true',
    ...(options.headers || {}),
  };

  // Only add application/json if body is not FormData
  if (!(options.body instanceof FormData) && !('Content-Type' in headers)) {
    (headers as Record<string, string>)['Content-Type'] = 'application/json';
  }

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.detail || errorData.message || `HTTP Error ${response.status}`);
    }

    return await response.json();
  } catch (err: any) {
    if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
      throw new Error(`Backend server is offline or unreachable at ${API_BASE_URL}`);
    }
    throw err;
  }
}

export const api = {
  // Authentication Endpoints (Postman collection item 1)
  register: (data: RegisterPayload) =>
    fetchAPI<{ message: string; user?: User }>('/register/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  verifyOTP: (data: VerifyOTPPayload) =>
    fetchAPI<{ message: string }>('/verify-otp/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  resendOTP: (data: ResendOTPPayload) =>
    fetchAPI<{ message: string }>('/resend-otp/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: async (data: LoginPayload): Promise<LoginResponse> => {
    const res = await fetchAPI<LoginResponse>('/login/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.tokens?.access) {
      sessionStorage.setItem('access_token', res.tokens.access);
      sessionStorage.setItem('refresh_token', res.tokens.refresh);
    }
    return res;
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('access_token');
      sessionStorage.removeItem('refresh_token');
    }
  },

  getProfile: () => fetchAPI<User>('/profile/'),

  updateProfile: (data: FormData) =>
    fetchAPI<User>('/profile/', {
      method: 'PATCH',
      body: data,
    }),

  changePassword: (data: ChangePasswordPayload) =>
    fetchAPI<{ message: string }>('/change-password/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  forgotPassword: (data: ForgotPasswordPayload) =>
    fetchAPI<{ message: string }>('/forgot-password/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  resetPassword: (data: ResetPasswordPayload) =>
    fetchAPI<{ message: string }>('/reset-password/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Course & Category Endpoints (Postman collection item 2)
  getCategories: () => fetchAPI<Category[]>('/categories/'),

  createCategory: (data: { name: string; description?: string }) =>
    fetchAPI<Category>('/categories/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getCourses: (page: number = 1, search?: string, category?: string, level?: string) => {
    const params = new URLSearchParams({ page: page.toString() });
    if (search) params.append('search', search);
    if (category) params.append('category__name', category);
    if (level) params.append('level', level);
    return fetchAPI<PaginatedResponse<Course>>(`/courses/?${params.toString()}`);
  },

  createCourse: (data: CreateCoursePayload) =>
    fetchAPI<Course>('/courses/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateCourse: (slug: string, data: Partial<Course>) =>
    fetchAPI<CourseDetail>(`/courses/${slug}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  getCourseDetail: (slug: string) => fetchAPI<CourseDetail>(`/courses/${slug}/`),

  enrollCourse: (slug: string) =>
    fetchAPI<{ message: string; enrollment?: any }>(`/courses/${slug}/enroll/`, {
      method: 'POST',
    }),

  completeLesson: (slug: string, lessonId: number) =>
    fetchAPI<{ message: string; lesson_id: number }>(`/courses/${slug}/complete_lesson/`, {
      method: 'POST',
      body: JSON.stringify({ lesson_id: lessonId }),
    }),

  emailCertificate: (slug: string, pdfBase64: string) =>
    fetchAPI<{ message: string }>(`/courses/${slug}/email_certificate/`, {
      method: 'POST',
      body: JSON.stringify({ pdf_base64: pdfBase64 }),
    }),

  getMyCourses: () => fetchAPI<Course[]>('/courses/my_courses/'),

  getDashboardStats: () => fetchAPI<DashboardStats>('/dashboard/stats/'),

  getEnrollments: () => fetchAPI<EnrollmentRecord[]>('/enrollments/'),

  // Review Endpoints
  getReviews: (courseSlug?: string) => {
    const url = courseSlug ? `/reviews/?course_slug=${courseSlug}` : '/reviews/';
    return fetchAPI<CourseReview[]>(url);
  },

  createReview: (data: CourseReviewPayload) =>
    fetchAPI<CourseReview>('/reviews/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Module Endpoints
  createModule: (data: { course: number; title: string; order?: number }) =>
    fetchAPI<any>('/modules/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateModule: (id: number, data: { title?: string; order?: number }) =>
    fetchAPI<any>(`/modules/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  deleteModule: (id: number) =>
    fetchAPI<{ message?: string }>(`/modules/${id}/`, {
      method: 'DELETE',
    }),

  // Lesson Endpoints
  createLesson: (data: { module: number; title: string; video_url?: string; content?: string; duration?: number; order?: number; is_preview?: boolean }) =>
    fetchAPI<any>('/lessons/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateLesson: (id: number, data: any) =>
    fetchAPI<any>(`/lessons/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  deleteLesson: (id: number) =>
    fetchAPI<{ message?: string }>(`/lessons/${id}/`, {
      method: 'DELETE',
    }),
  // Payment & Stripe Endpoints (Postman collection item 3)
  createCheckoutSession: (courseId: number) =>
    fetchAPI<{ checkout_url: string; session_id: string }>('/payments/create-checkout-session/', {
      method: 'POST',
      body: JSON.stringify({ course_id: courseId }),
    }),

  createCheckoutSessionById: (courseId: number) =>
    fetchAPI<{ checkout_url: string; session_id: string }>(`/payments/create-checkout-session/${courseId}/`, {
      method: 'POST',
    }),

  getPaymentHistoryCustomer: (queryParams?: string) =>
    fetchAPI<PaymentRecord[]>(`/payments/history/customer/${queryParams ? `?${queryParams}` : ''}`),

  getPaymentHistoryMentor: (queryParams?: string) =>
    fetchAPI<PaymentRecord[]>(`/payments/history/mentor/${queryParams ? `?${queryParams}` : ''}`),

  // Chat & AI Advisor Endpoints (Postman collection item 4)
  sendAIChatMessage: (message: string) =>
    fetchAPI<ChatMessageResponse>('/chat/recommend/', {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),

  getChatHistory: () => fetchAPI<ChatMessageResponse[]>('/chat/history/'),
};
