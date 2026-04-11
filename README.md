# Cloud Buffet Booking System (BuffetEase)

**COMP4442 Semester Project**

This is a frontend project for a cloud-based buffet reservation system developed using React.js. The system provides customers with online booking, availability checking, and reservation management, while also featuring an admin dashboard for managing schedules and orders.

## Key Features

*   **Customer Portal:**
    *   Browse buffet packages.
    *   Book reservations by selecting date, number of guests, and session.
    *   View personal booking history.
    *   Cancel reservations.
*   **Admin Dashboard:**
    *   View all reservation records and statuses.
    *   Confirm or manage customer bookings.
    *   Manage buffet packages and dining sessions.

## Tech Stack

*   **Frontend Framework:** React.js (Vite)
*   **Routing:** React Router v6
*   **UI Components:** Tailwind CSS, shadcn/ui, Lucide Icons
*   **Animations:** Framer Motion
*   **State & Data:** React Context API, LocalStorage (Mock Backend)

## Getting Started

If you are opening this project for the first time, follow these steps to run it locally:

### 1. Install Node.js
Ensure you have [Node.js](https://nodejs.org/) installed (version 18 or higher recommended).

### 2. Install Dependencies
Open a terminal in the project root directory and run the following command to install the necessary packages:
```bash
npm install
```

### 3. Start Development Server
After installation is complete, run the following command to start the project:
```bash
npm run dev
```
Once the server starts, open your browser and go to `http://localhost:3000` to preview the website.

## Mock Accounts

This project currently uses LocalStorage to simulate the backend and authentication state. You can use the following test accounts on the sign-in page:

*   **Admin Account:** `admin@test.com`
*   **Customer Account:** `user@test.com` (or any other email address)
