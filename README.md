# SkillPilot - Smart E-Learning & Skill Development Platform

**SkillPilot** is an intelligent, full-stack online e-learning and career development platform designed to empower students and instructors (mentors). The platform combines course authoring, multi-role user dashboards, adaptive video distribution, automated payment handling via Stripe, and an integrated **Google Gemini AI Skill Advisor** that analyzes student skillsets and career goals to recommend personalized learning pathways.

## 🚀 Key Features

*   **Google Gemini AI Skill Advisor:** Interactive floating chat widget that provides personalized learning pathways based on your skills and goals.
*   **Multi-Role Dashboards:** Distinct experiences for Students and Mentors (Instructors).
*   **Course Explorer & Adaptive Video Player:** HLS adaptive bitrate streaming (`.m3u8`) with previews and module tracking.
*   **Seamless Stripe Payments:** Automated checkout sessions and webhook event listeners for instant enrollments.
*   **Secure Authentication:** JWT-based auth with OTP email verification and Role-Based Access Control (RBAC).

## 🛠️ Technology Stack

*   **Frontend:** React, Next.js, Tailwind CSS (Vanilla design system with glassmorphism), Framer Motion, Axios.
*   **Backend:** Python 3.13, Django 6.0, Django REST Framework (DRF 3.17).
*   **Database:** SQLite (Default) / PostgreSQL (Production).
*   **Integrations:** Stripe API, Google Gemini AI API.

---

## 💻 Local Development Setup

Follow these steps to set up the project locally.

### Prerequisites

*   [Node.js](https://nodejs.org/) (v18 or higher)
*   [Python](https://www.python.org/downloads/) (v3.13 recommended)
*   [ngrok](https://ngrok.com/) (For testing Stripe Webhooks locally)
*   Stripe Account (for API keys)
*   Google Gemini API Key

### 1. Backend Setup (Django)

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Create and activate a virtual environment:**
    ```bash
    python3.13 -m venv env
    # Or, on Windows if python3.13 is not recognized:
    py -3.13 -m venv env
    # On Windows:
    source env/Scripts/activate
    .\env\Scripts\activate
    
    # On macOS/Linux:
    source env/bin/activate
    ```

3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Set up Environment Variables:**
    Create a `.env` file in the `backend` directory with the following variables:
    ```env
    
    EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
    EMAIL_HOST=smtp.gmail.com
    EMAIL_PORT=587
    EMAIL_USE_TLS=True
    EMAIL_HOST_USER=tntanvir2382018@gmail.com
    EMAIL_HOST_PASSWORD=*********************
    DEFAULT_FROM_EMAIL=tntanvir2382018@gmail.com
    
    
    STRIPE_PUBLISHABLE_KEY=*********************
    STRIPE_SECRET_KEY=*********************
    STRIPE_WEBHOOK_SECRET=*********************
    FRONTEND_URL=http://localhost:3000
    
    
    GEMINI_API_KEY=*********************
    ```

5.  **Run Migrations:**
    ```bash
    python manage.py migrate
    ```

6.  **Start the Development Server:**
    ```bash
    python manage.py runserver
    ```
    *The backend will be running at `http://127.0.0.1:8000`*

### 2. Frontend Setup (Next.js)

1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**
    Create a `.env.local` file in the `frontend` directory:
    ```env
    NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
    ```

4.  **Start the Development Server:**
    ```bash
    npm run dev
    ```
    *The frontend will be running at `http://localhost:3000`*

### 3. Ngrok Setup (For Stripe Webhooks)

To test Stripe payments and automatic enrollments locally, Stripe needs to send webhook events to your local Django server. We use `ngrok` to expose the local server to the internet.

1.  **Start Ngrok on the backend port (8000):**
    ```bash
    ngrok http 8000
    ```

2.  **Update Stripe Webhook URL:**
    *   Copy the `Forwarding` HTTPS URL from the ngrok terminal (e.g., `https://<your-ngrok-id>.ngrok-free.app`).
    *   Go to your Stripe Dashboard -> Developers -> Webhooks.
    *   Add an endpoint: `https://<your-ngrok-id>.ngrok-free.app/api/payment/webhook/` (Ensure the trailing slash matches your Django URLs).
    *   Select the event: `checkout.session.completed`.

3.  **Update `.env` Webhook Secret:**
    *   Copy the *Signing secret* from the Stripe Dashboard for this new endpoint.
    *   Update `STRIPE_WEBHOOK_SECRET` in your backend `.env` file.
    *   Restart your Django server.

---

## 👥 Authors

*   **Tanvir & Team** - *University Final Year Capstone Project*
