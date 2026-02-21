# Real-Time Expert Session Booking System: Workflow

This document details the user journey and system processes for different scenarios in the ExpertBook application.

## 1. User Onboarding
-   **Registration:** New users hit the `/register` endpoint (UI: `/register`) providing Name, Email, and Password.
-   **Authentication State:** A JSON Web Token (JWT) is returned and saved to `localStorage` via Zustand's `useAuthStore`.
-   **Role:** By default, all new users are given the `isExpert: false` flag.

## 2. Upgrading to an Expert
-   **Profile Page (`/profile`):** A standard user visits their profile page.
-   **Action:** Click the `Become an Expert` button.
-   **Backend Flow:** Calls `/api/auth/become-expert`. The server sets `user.isExpert = true` and creates an initial `Expert` model document.
-   **Result:** The user gains access to the `Expert Dashboard`.

## 3. Expert Event Type Creation
-   **Expert Dashboard (`/expert-dashboard`):** Only accessible if `user.isExpert === true`.
-   **Creation:** The Expert defines an Event Type (Title, Duration, Location, public URL slug).
-   **Publishing:** Saved to the DB via `/api/event-types`.

## 4. Booking Flow (Client Side)
-   **Public Link:** An Expert shares their public URL (e.g., `/expert/:id` or `/username`).
-   **Listing:** The client views the available standard offerings (Event Types).
-   **Selection:**
    -   Client selects an Event Type.
    -   They pick an available Date and Time from a calendar view (currently standard daily slots from 8 AM to 5 PM).
    -   They provide their Name, Email, Phone, and Notes.
-   **Commit:** A local API call goes to `/api/bookings`.

## 5. Backend Booking Resolution (Transaction & Integrations)
-   **Validation:** The server checks if the exact `Date` and `Time` slot for that `ExpertId` is already booked.
-   *(Optional MVP Flow)* **Transactions:** A MongoDB session opens and locks the booking attempt. If two people book at the exact same millisecond, the first one is committed.
-   **Video Integration:** The `bookingController` auto-generates mock Google Meet (`https://meet.google.com/...`) and Zoom (`https://zoom.us/j/...`) links upon booking instantiation.
-   **Save & Broadcast:** Booking saves. `Socket.io` emits a `newBooking` event.

## 6. Dashboard & Management
-   **My Bookings (`/my-bookings`):** Users view their Upcoming and Past bookings.
-   **Actions:** 
    -   **Add to Calendar:** Generates and downloads a `.ics` file using the `ics` Node.js package.
    -   **Cancel:** Calls a `PATCH` request to toggle booking status. Real-time updates push this to the UI.
    -   **Join Meeting:** Directly links to the auto-generated Zoom/Google Meet URL.
