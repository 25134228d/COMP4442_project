# BuffetEase - Cloud Buffet Booking System

Semester project for a cloud-based buffet reservation platform.

BuffetEase includes:
- A React (Vite) frontend for customers and admins
- A Spring Boot backend that serves APIs
- JPA-based persistence layer (currently configured to run with H2 for local development)

## Features

### Customer Portal
- Browse buffet packages
- Book reservations by date, session, and guest count
- View personal booking history
- Cancel reservations

### Admin Dashboard
- View all reservations and statuses
- Confirm/manage customer bookings
- Manage buffet packages and dining sessions

## Tech Stack

### Frontend
- React + Vite
- React Router
- Tailwind CSS + shadcn/ui + Lucide Icons
- Framer Motion
- Axios for API calls

### Backend
- Spring Boot 3
- Spring Web
- Spring Data JPA
- Maven
- H2 (default local profile)
- MySQL-ready configuration via environment variables

---

## Project Structure

- Frontend root: current folder
- Backend: [springboot-server](springboot-server)

---

## Prerequisites

Install the following tools before running locally:

1. Node.js 18+
2. Java 17+
3. Maven 3.9+

---

## Setup Steps (Recommended)

### 1) Install frontend dependencies

From project root:

```bash
npm install
```

### 2) Run backend (Spring Boot)

Important: run this command inside [springboot-server](springboot-server), not project root.

```bash
cd springboot-server
mvn spring-boot:run
```

Backend URL:
- http://localhost:8080

### 3) Run frontend (Vite dev server)

Open a second terminal from project root:

```bash
npm run dev
```

Frontend URL:
- http://localhost:3000

The Vite proxy forwards `/api` requests to `http://localhost:8080`.

---

## Alternative: Serve frontend from Spring Boot

If you want Spring Boot to serve the built frontend:

```bash
npm run build
cd springboot-server
mvn spring-boot:run
```

Then access:
- http://localhost:8080

---

## Local Development Accounts

Use these emails on the sign-in page:

- Admin: `admin@test.com`
- Customer: `user@test.com` (or any other email)

---

## Troubleshooting

### Error: `No plugin found for prefix 'spring-boot'`

Cause: You ran Maven from the wrong folder.

Fix:

```bash
cd springboot-server
mvn spring-boot:run
```

### Error: `Port 8080 was already in use`

Cause: Another process is already using port `8080`.

Fix by stopping the old process, or run with another port:

```bash
cd springboot-server
mvn spring-boot:run -Dspring-boot.run.arguments=--server.port=8081
```

---

## Backend Database Notes

- Current local setup uses H2 in-memory DB for easy startup.
- MySQL connection settings are prepared in backend config and can be supplied via environment variables:
    - `MYSQL_URL`
    - `MYSQL_USER`
    - `MYSQL_PASSWORD`

```
