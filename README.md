# Real-Time Expert Session Booking System (ExpertBook)

A full-stack web application designed for professionals to create customizable event types and allow clients to seamlessly book slots with real-time slot availability.

## 🌟 Key Features

*   **Role Setup:** Users can easily upgrade their profile to an [Expert](cci:1://file:///e:/real-time/server/controllers/authController.js:105:0-134:2) account.
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
