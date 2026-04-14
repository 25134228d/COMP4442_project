# Cloud Buffet Booking System (BuffetEase)

**COMP4442 Semester Project**

This repository now contains:
- **Frontend**: React + Vite (in project root)
- **Backend**: Spring Boot + Google OAuth2 + JWT + MySQL (in `/backend`)

## 1) Frontend Setup

```bash
npm install
npm run dev
```

Frontend env (create `.env` from `.env.example`):
- `VITE_API_BASE_URL` (default `http://localhost:8080`)

## 2) Backend Setup

### Start MySQL
```bash
docker compose up -d
```

### Run backend
```bash
cd backend
cp .env.example .env
# export vars from .env (or configure in IDE)
mvn spring-boot:run
```

Backend defaults to `http://localhost:8080`.

## 3) Google OAuth2 Configuration

In Google Cloud Console:
- Create OAuth2 Web Application credentials.
- Authorized redirect URI:
  - `http://localhost:8080/login/oauth2/code/google`

Set backend environment variables:
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `FRONTEND_BASE_URL` (e.g., `http://localhost:3000`)
- `CORS_ALLOWED_ORIGINS` (e.g., `http://localhost:3000`)
- `ADMIN_EMAILS` (comma-separated admin emails)

## 4) Authentication Flow

1. User clicks **Sign In with Google** on frontend.
2. Frontend redirects to Spring Boot OAuth2 endpoint.
3. Spring Boot handles Google callback, upserts user in MySQL, issues JWT.
4. Backend redirects to frontend callback with `?token=`.
5. Frontend stores token and loads profile from `/api/auth/me`.

## 5) AWS EC2 Deployment Notes

Recommended setup:
- EC2 for Spring Boot service
- RDS MySQL for database
- Nginx reverse proxy + HTTPS

High-level steps:
1. Build backend jar (`mvn clean package`).
2. Upload jar to EC2 and run as `systemd` service.
3. Configure env vars on EC2 (`JWT_SECRET`, DB, Google OAuth).
4. Point Google OAuth redirect URI to production backend domain.
5. Open only required ports and restrict DB access.
