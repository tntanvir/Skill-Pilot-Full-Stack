# SkillPilot - Smart E-Learning & Skill Development Platform
## Full-Stack Project Specification & Core Features

**Project Name:** SkillPilot  
**Project Type:** University Final Year Capstone Project  
**Architecture:** Decoupled Full-Stack Architecture (Django REST Framework + Modern Frontend)  
**Author:** Tanvir & Team  

---

## 1. Executive Overview

**SkillPilot** is an intelligent, full-stack online e-learning and career development platform designed to empower students and instructors (mentors). The platform combines course authoring, multi-role user dashboards, adaptive video distribution, automated payment handling via Stripe, and an integrated **Google Gemini AI Skill Advisor** that analyzes student skillsets and career goals to recommend personalized learning pathways.

---

## 2. Frontend Technologies & Architecture

### Technology Stack
- **Framework & Architecture:** React / Next.js Single Page Application (SPA) architecture
- **Design & Styling:** Vanilla CSS Design System with dark mode styling, subtle micro-animations, glassmorphic containers, and modern typography (Google Fonts Inter / Outfit)
- **State Management & Routing:** Component-level state management, context providers, and dynamic client routing
- **API Client:** Axios / Fetch API integration with JWT Bearer token authentication headers
- **Video Player Integration:** Custom Video Player with HLS adaptive bitrate stream rendering (`.m3u8`) and preview access controls
- **UI Components:** Dynamic course cards, category filters, interactive AI chat widget, checkout status notifications, and mentor earnings charts

### Core Frontend Features

#### 1. Interactive AI Chatbot Widget
- Floating, interactive AI assistant powered by Google Gemini.
- Enables students to type their background skills and career goals in natural language.
- Displays rich AI recommendations alongside clickable course recommendation cards.

#### 2. Student & Mentor Dashboards
- **Student Dashboard:** Enrolled courses, video progress tracking, purchase receipts, and account settings.
- **Mentor Dashboard:** Course authoring suite, module/lesson manager, enrolled student count, and earnings history breakdown.

#### 3. Course Explorer & Filtering
- Dynamic search bar with category filtering and difficulty level tags (Beginner, Intermediate, Advanced).
- Interactive course details page displaying instructor bio, curriculum accordion, lesson previews, and pricing.

#### 4. Seamless Stripe Payment Gateway Flow
- One-click checkout trigger redirecting to Stripe's secure payment interface.
- Automatic handling of payment success and cancellation return states with real-time UI status alerts.

#### 5. Adaptive Video Learning Interface
- High-definition video player supporting multi-quality streaming and HLS playlist rendering.
- Structured sidebar showing course modules, lessons, duration, and completion status.

---

## 3. Backend Technologies & Architecture

### Technology Stack
- **Core Environment:** Python 3.13 & Django 6.0
- **API Framework:** Django REST Framework (DRF 3.17)
- **Authentication Engine:** SimpleJWT with access token rotation and refresh token blacklisting
- **Artificial Intelligence:** Google Gemini API REST integration (`gemini-2.5-flash` / `gemini-2.0-flash`)
- **Payment Processing:** Stripe API integration (Checkout Sessions & Webhook Event Listeners)
- **Email Infrastructure:** Django SMTP Mail Engine with customizable OTP verification templates
- **Content Distribution:** HLS Master Playlist handling (`.m3u8`) and Google Drive video stream processing
- **Environment & Filtering:** `python-decouple` configuration and `django-filter` engine

### Core Backend Features

#### 1. Secure Multi-Role Authentication (`accounts` app)
- Role-Based Access Control (RBAC) supporting `student`, `mentor`, and `admin` roles.
- Email verification powered by automated One-Time Passwords (OTP) with configurable expiration limits.
- Secure JWT login, profile management, authenticated password change, and OTP-driven password recovery.

#### 2. Dynamic Course & Content Engine (`course` app)
- Hierarchical data architecture: Categories $\rightarrow$ Courses $\rightarrow$ Modules $\rightarrow$ Lessons.
- Video access control rules restricting full lesson access to enrolled students or course mentors while supporting preview lessons (`is_preview`).
- Automated slug creation for clean, SEO-friendly course URLs.

#### 3. Google Gemini AI Skill Advisor (`chat` app)
- Real-time skill analysis and career goal evaluation powered by Google Gemini AI.
- Dynamic database integration querying active published courses to recommend matching learning paths (e.g. Python + Backend $\rightarrow$ Django/FastAPI; JavaScript + Backend $\rightarrow$ Node.js).
- Conversation history tracking saving messages, AI responses, detected skills, and linked course records.
- Built-in rate limit handling, automatic model fallbacks, and intelligent rule-based backup advisor.

#### 4. Automated Stripe Payment & Enrollment Engine (`payment` app)
- Native Stripe Checkout Session generation for paid course purchases.
- Cryptographically verified Stripe Webhook listener handling `checkout.session.completed` events to automatically create student enrollments in the background.
- Customer payment history endpoint with filtering by payment status (`pending`, `completed`, `failed`) and min/max amount.
- Mentor earnings history endpoint tracking total course revenue earned by instructors.

---

## 4. Full-Stack Feature Matrix

| Feature | Frontend Capabilities | Backend Engine |
| :--- | :--- | :--- |
| **User Authentication** | Registration, Login, OTP verification modal, Password reset | Custom User model, JWT authentication, SMTP OTP generator |
| **AI Career Guidance** | Interactive floating chat widget, recommendation cards | Gemini API REST client, database context injection, `chat` app |
| **Course Catalog** | Search bar, category filters, difficulty tags | DRF List/Retrieve views, `django-filter` querying |
| **Curriculum & Video** | HLS video player, module accordion, preview player | HLS playlist resolver, access control permission rules |
| **Stripe Monetization** | Checkout button, success/cancel payment alerts | Stripe Session API, Webhook signature verification, `payment` app |
| **Instructor Suite** | Course creator form, lesson uploader, earnings dashboard | Multi-role permissions, mentor earnings filtering |
