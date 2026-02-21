# Real-Time Expert Session Booking System (ExpertBook)

A full-stack web application designed for professionals to create customizable event types and allow clients to seamlessly book slots with real-time slot availability.

## 🌟 Key Features

*   **Role Setup:** Users can easily upgrade their profile to an `Expert` account.
*   **Custom Event Types:** Experts can create specific meeting templates (e.g., 15-minute sync, 60-minute deep dive).
*   **Shareable Links:** Every event generates a unique URL that experts can share directly with clients.
*   **Real-Time Booking:** Built with Socket.io. When a client books a slot, that specific time is instantly marked unavailable for everyone else, preventing double bookings.
*   **Concurrency Safe:** Leverages MongoDB Transactions to guarantee atomic booking creation and eliminate race conditions if two users click exactly at the same millisecond.
*   **Auto-Video Links:** Automatically generates dynamic mock Zoom and Google Meet links upon successful booking completion.
*   **Calendar Integration:** Provides downloadable `.ics` files so users and experts can directly add confirmed sessions to Apple/Outlook/Google Calendars.
*   **Authentication & Security:** JWT-based protection keeps profiles, dashboards, and passwords secure.

## 🛠️ Tech Stack

*   **Frontend:** React.js, Vite, Tailwind CSS, Zustand (State Management), React Router DOM.
*   **Backend:** Node.js, Express.js.
*   **Database:** MongoDB & Mongoose.
*   **Real-Time Communication:** Socket.io.
*   **Styling:** Lucide React for iconography, custom Tailwind utilities for animations.

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18+ recommended)
*   MongoDB (A local instance or an Atlas connection string)

### 1. Backend Setup
1. Open terminal and navigate to server folder: `cd server`
2. Install dependencies: `npm install`
3. Create a `.env` file in the `server` root:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```
4. Start the server: `npm run dev` (or `node server.js`)

### 2. Frontend Setup
1. Open a new terminal and navigate to client folder: `cd client`
2. Install dependencies: `npm install`
3. Start the dev server: `npm run dev`

### 3. Usage Flow
1. Navigate to `http://localhost:5173`.
2. **Register** a new account.
3. Visit the **Profile** page and click **Become an Expert**.
4. Go to your **Expert Dashboard**, create a new `Event Type`.
5. Open the provided public link, pick a time, and test the booking flow!
6. Visit **My Bookings** to view generated Video links and download Calendar files.

## 📚 Documentation
Please check the specific `.md` files in the root directory for deeper dives into:
*   [Architecture](architecture.md): Overview of components and data flow.
*   [Workflow](workflow.md): Step-by-step logic of how user flows function.
*   [Deployment](deployment.md): Steps to host the Frontend on Vercel and Backend on Render.

## 📄 License
This MVP is licensed under the MIT License.
