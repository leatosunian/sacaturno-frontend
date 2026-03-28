# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SacaTurno is a Spanish-language SaaS platform for appointment/schedule management targeting Argentine businesses. It is a monorepo with a Next.js frontend and a separate Express.js backend in `/server`.

## Commands

### Frontend (root directory)
```bash
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Production build
npm start        # Start production server
npm run lint     # Run ESLint
```

### Backend (`/server` directory)
```bash
npm run dev      # Start with nodemon (port 4000)
npm run build    # TypeScript compilation (tsc)
npm start        # Run compiled app (node dist/app.js)
```

The frontend expects the backend at `http://localhost:4000` in development. The production backend is on Railway.

## Architecture

### Monorepo Structure
- `/app` — Next.js 13 App Router pages
- `/components` — React components
- `/server/src` — Express.js backend (controllers, models, routes, middlewares)
- `/interfaces` — Shared TypeScript interfaces matching backend Mongoose schemas
- `/config/axios.tsx` — Axios instance; points to production Railway URL by default (change for local dev)
- `/app/context` — React Context for auth state
- `/middleware.ts` — Next.js middleware protecting `/admin/*` routes

### Authentication Flow
1. User logs in via `/login` → credentials sent to Next.js API route `/api/login`
2. Backend validates credentials, returns JWT
3. Token stored in HTTP-only cookies (`sacaturno_token`, `sacaturno_userID`)
4. `middleware.ts` checks cookies to protect `/admin/*` routes
5. `AuthContext` holds global auth state (user info, loading)
6. `/api/checkauth` verifies token validity on the server

### Next.js API Routes (thin proxy layer)
- `/api/login` — Sets auth cookies
- `/api/logout` — Clears auth cookies
- `/api/checkauth` — JWT verification

All business logic lives in the Express backend at `/server/src`.

### Key Patterns
- **Forms**: React Hook Form + Zod (schemas in `/app/schemas/`)
- **Data fetching**: Axios (custom instance in `/config/axios.tsx`) and SWR
- **Styling**: Tailwind CSS + shadcn/ui components (in `/components/ui/`) + CSS Modules in `/app/css-modules/`
- **Notifications**: Sonner (`toast()`)
- **Calendar UI**: React Big Calendar in the admin schedule/dashboard views

### Route Structure
- `/` — Public landing page (features, pricing, testimonials)
- `/admin/*` — Protected admin dashboard (business mgmt, schedule, profile)
- `/[slug]` — Public business profile pages for customer booking
- `/public/search` — Business search for customers
- `/login`, `/register` — Auth pages

### Backend (`/server/src`)
- `app.ts` — Express setup, CORS, route registration
- `controllers/` — Business logic handlers
- `models/` — Mongoose schemas (User, Business, Appointment, Service, Schedule, Subscription)
- `routes/` — API endpoint definitions
- `middlewares/` — JWT auth verification, Multer file uploads
- Integrations: MercadoPago (payments), Resend (email), node-cron (scheduled jobs)

## Code Style

- Use comments sparingly. Only comment complex code.

## Environment Variables
The frontend reads from `.env`:
- `BACKEND_URL` — Backend API URL (default: `http://localhost:4000/api`)
- `MONGO_URL` — MongoDB connection string
- `JWT_SECRET` — Secret for JWT signing
- `FRONTEND_URL` / `SERVER_URL` — Used for CORS and redirects
