# Real-Time Expert Session Booking System: Architecture

This document outlines the high-level architecture of the ExpertBook project.

## Tech Stack
-   **Frontend:** React, Vite, Tailwind CSS, Zustand (State Management), React Router.
-   **Backend:** Node.js, Express, MongoDB (Mongoose), Socket.io (Real-time updates).
-   **Authentication:** JSON Web Tokens (JWT) & bcryptjs for password hashing.
-   **Calendar Integration:** `ics` library for generating downloadable calendar files.

## High-Level Data Flow

1.  **Frontend (Client):** 
    -   Handles all UI interactions. 
    -   `Zustand` manages global state like `user` authentication data. 
    -   `Axios` handles the RESTful API calls to the backend.
2.  **Backend (Server):**
    -   Exposes a RESTful API organized by controllers (`authController`, `bookingController`, `expertController`).
    -   Validates endpoints via `authMiddleware` to protect user-specific routes.
    -   `Socket.io` runs alongside the Express server, emitting events like `newBooking` or `statusUpdate` to all connected clients.
3.  **Database (MongoDB):**
    -   Stores structured data across collections (Models: `User`, `Expert`, `Booking`, `EventType`).
    -   Utilizes MongoDB sessions & transactions for advanced booking (to prevent double-booking simultaneously) where applicable.

## Core Models

-   **User:** Represents standard clients. Stores authentication data and an `isExpert` flag.
-   **Expert:** Represents the service provider. Linked to a User. Contains public profile data and `bufferTime`.
-   **EventType:** Types of sessions an expert offers (e.g., 30 Min Video Call).
-   **Booking:** The actual scheduled appointment between a User and an Expert. Includes auto-generated Video Meeting links.

## System Components & Routes

### Frontend Routes
-   `/` (Public Landing Page)
-   `/experts` (List of Experts)
-   `/:username` (Public Booking Page for an Expert)
-   `/:username/:eventSlug` (Slot Selection Page)
-   `/my-bookings` (Protected: Dashboard for Users to manage their bookings)
-   `/expert-dashboard` (Protected: Dashboard for Experts to manage their Event Types)
-   `/profile` (Protected: Profile management & Role upgrading)

### Backend API (`/api/*`)
-   `/auth/...` (Login, Register, Profile Management, Become Expert)
-   `/experts/...` (Fetching Experts, Creating initial profiles)
-   `/event-types/...` (CRUD for Experts' offerings)
-   `/bookings/...` (Creating bookings, fetching user/expert bookings, updating statuses)
