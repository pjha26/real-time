# Real-Time Expert Session Booking System (ExpertBook)

A comprehensive, production-ready full-stack web application designed for professionals to create customizable event types and allow clients to seamlessly book slots with real-time slot availability, AI-powered matching, and advanced analytics.

## 🌟 Key Features

*   **Role-Based Access Control:** Secure user journeys tailored for standard Clients, Experts, and Admins.
*   **AI-Powered Expert Matching:** Integrates with the Gemini API to match users with the perfect expert based on their needs and input.
*   **Intelligent Dashboard & Analytics:** Dynamic dashboards powered by Recharts, offering AI insights, prioritized flow tasks, and detailed engagement metrics.
*   **Automated AI Session Notes:** Automatically generates post-session summaries and briefing notes utilizing Gemini's generative AI capabilities.
*   **Multi-Timezone Support:** Robust scheduling built with `date-fns-tz` to seamlessly handle bookings across different global time zones.
*   **Custom Event Types:** Experts can create specific meeting templates (e.g., 15-minute sync, 60-minute deep dive).
*   **Real-Time Booking:** Built with Socket.io. When a client books a slot, that specific time is instantly marked unavailable for everyone else, preventing double bookings.
*   **Auto-Video Links:** Automatically generates dynamic mock Zoom and Google Meet links upon successful booking completion.
*   **Authentication & Security:** Secure authentication flows powered by Clerk, protecting profiles, routes, and data.

## 🛠️ Tech Stack

*   **Frontend:** React.js, Vite, Tailwind CSS (v4), Zustand (State Management), React Router DOM, Recharts (Data Visualization), Clerk (Auth).
*   **Backend:** Node.js, Express.js.
*   **Database:** Supabase (PostgreSQL) / MongoDB.
*   **Real-Time Communication:** Socket.io.
*   **AI Integration:** Google Generative AI (Gemini API).

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18+ recommended)
*   Supabase or MongoDB Database connection
*   Clerk API Keys (for authentication)
*   Google Gemini API Key

### 1. Backend Setup
1. Open terminal and navigate to server folder: `cd server`
2. Install dependencies: `npm install`
3. Create a `.env` file in the `server` root:
   ```env
   PORT=5000
   DATABASE_URL=your_database_connection_string
   CLERK_SECRET_KEY=your_clerk_secret_key
   GEMINI_API_KEY=your_gemini_api_key
   ```
4. Start the server: `npm run dev`

### 2. Frontend Setup
1. Open a new terminal and navigate to client folder: `cd client`
2. Install dependencies: `npm install`
3. Create a `.env` file in the `client` root:
   ```env
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   VITE_API_BASE_URL=http://localhost:5000/api
   ```
4. Start the dev server: `npm run dev`

### 3. Usage Flow
1. Navigate to `http://localhost:5173`.
2. **Register/Login** using the Clerk authentication flow.
3. Access the AI Match page to find suitable experts.
4. Go to your **Expert Dashboard**, manage your profile, and analyze session metrics.
5. Clients can open an expert's public link, view time slots in their local timezone, and book sessions.
6. Check **My Bookings** to view generated Video links, AI-generated session notes, and manage schedule.

## 📚 Documentation
Please check the specific `.md` files in the root directory for deeper dives into:
*   [Architecture](architecture.md): Overview of components and data flow.
*   [Workflow](workflow.md): Step-by-step logic of how user flows function.
*   [Deployment](deployment.md): Steps to host the Frontend on Vercel and Backend on Render/Supabase.

## 📄 License
This MVP is licensed under the MIT License.
