# Real-Time Expert Session Booking System: Deployment Guide

This document outlines the deployment process for ExpertBook. MERN stack projects generally deploy the frontend and backend to separate hosting services for scalability.

## 1. Hosting Services Recommendation
-   **Frontend (React/Vite):** Vercel, Netlify, or Firebase Hosting. (We will use **Vercel** as an example).
-   **Backend (Node/Express):** Render, Heroku, or DigitalOcean App Platform. (We will use **Render** as an example due to native WebSockets/Socket.io support).
-   **Database:** MongoDB Atlas (already configured in `.env`).

---

## 2. Environment Variables Preparation

Before deploying, ensure you have your production environment variables ready:
-   `MONGO_URI` = Your MongoDB Atlas Connection String
-   `JWT_SECRET` = A strong ranodm string (e.g., `crypto.randomBytes(64).toString('hex')`)
-   `NODE_ENV` = `production`
-   `PORT` = Typically left blank or `5000` (Hosting providers automatically set the port).
-   **Frontend Side:** Update the `axios` base URLs. Currently, they point to `http://localhost:5000`. You must change this to your deployed backend URL.
    -   *Tip:* Create a `.env` in the `client` folder with `VITE_API_URL=https://your-backend-url.onrender.com` and replace hardcoded URLs with `import.meta.env.VITE_API_URL`.

---

## 3. Deploying the Backend (Render)

1.  Create an account on [Render](https://render.com/).
2.  Click **New +** and select **Web Service**.
3.  Connect your GitHub repository containing the backend code.
4.  **Configuration:**
    -   **Root Directory:** `server` (or leave blank if your server is in the root).
    -   **Build Command:** `npm install`
    -   **Start Command:** `node server.js`
5.  **Environment Variables:** Add all variables from Step 2 (MONGO_URI, JWT_SECRET, etc.).
6.  Click **Create Web Service**. Render will deploy your application. Once done, copy the resulting URL (e.g., `https://expertbook-api.onrender.com`).

---

## 4. Deploying the Frontend (Vercel)

1.  **Preparation:** Before deploying the frontend, update all your Axios calls and Socket connections to use the new backend URL generated in Step 3. (e.g. `const socket = io('https://expertbook-api.onrender.com');`).
2.  Create an account on [Vercel](https://vercel.com/).
3.  Click **Add New Project**.
4.  Connect your GitHub repository.
5.  **Configuration:**
    -   **Framework Preset:** Vite (Vercel should detect this automatically).
    -   **Root Directory:** `client`
6.  Click **Deploy**.
7.  Vercel will build and deploy the application (`npm run build`). Check for any build errors in the Vercel console.

---

## 5. Post-Deployment Checks

1.  Visit the frontend URL provided by Vercel.
2.  Register a new user account.
3.  Go to Profile > Become an Expert.
4.  Create an Event Type.
5.  Book a test session on the public link.
6.  Check `My Bookings` to ensure the Google Meet integration and Status updates work.
