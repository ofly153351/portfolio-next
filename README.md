# Peerapat Portfolio (Next.js)

A multilingual portfolio web app built with Next.js App Router. It provides a polished public portfolio experience and a backoffice panel for managing profile, skills, and project content through API-driven data.

## Features

- Modern portfolio landing page with animated sections and floating AI-style chat trigger
- Locale-based routing (`/en`, `/th`) with `next-intl`
- Public content loaded from backend API (`/api/content`)
- Admin login flow with cookie-based session + optional bearer token
- Backoffice CRUD workflows for:
  - Portfolio info
  - Technical skills
  - Project entries and image uploads
- AOS scroll animations optimized for subtle motion

## Tech Stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS v4
- `next-intl` for i18n
- Axios for API calls
- AOS for reveal animations
- Lucide React icons

## Requirements

- Node.js 20+
- npm 10+
- Backend API service running (default: `http://localhost:8080`)

## Environment Variables

Create `.env.local` from `.env.example`:

```bash
cp .env.example .env.local
```

Available variables:

- `NEXT_PUBLIC_API_BASE_URL` (default: `http://localhost:8080`)
- `BACKOFFICE_USERNAME` (default: `admin`)
- `BACKOFFICE_PASSWORD` (default: `admin123`)
- `BACKOFFICE_SESSION_SECRET` (change this in real environments)

## Run Locally

Install dependencies and start dev server:

```bash
npm install
npm run dev
```

Open:

- Public site: `http://localhost:3000/en`
- Admin login: `http://localhost:3000/en/admin/login`

Build for production:

```bash
npm run build
npm run start
```

## Project Structure

```text
portfolio-next/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx                  # locale layout + NextIntl provider
│   │   ├── page.tsx                    # main portfolio page
│   │   ├── admin/
│   │   │   ├── page.tsx                # backoffice screen
│   │   │   └── login/page.tsx          # admin login screen
│   │   └── works/
│   │       ├── page.tsx                # works listing
│   │       └── [slug]/page.tsx         # work detail page
│   ├── api/admin/
│   │   ├── login/route.ts              # sets admin session cookie
│   │   └── logout/route.ts             # clears admin session cookie
│   ├── components/
│   │   ├── ai/                         # AI-like chat UI components
│   │   ├── admin/                      # backoffice UI
│   │   ├── layout/                     # navbar/footer
│   │   ├── sections/                   # homepage/work sections
│   │   └── ui/                         # shared UI utilities (AOS provider, headings)
│   ├── globals.css
│   ├── layout.tsx                      # root layout
│   └── page.tsx                        # redirects to /en
├── i18n/
│   └── routing.ts                      # locale definitions
├── lib/
│   ├── admin-api.ts                    # axios client + API contracts
│   └── admin-auth.ts                   # session/auth helpers
├── messages/
│   ├── en.json                         # English translations
│   └── th.json                         # Thai translations
├── types/
│   ├── admin.ts
│   ├── ai.ts
│   ├── portfolio.ts
│   ├── ui.ts
│   └── works.ts
├── docs/
│   └── backoffice-api-requirements.md  # backend endpoint contract
├── i18n.ts                             # message loader config for next-intl
├── next.config.ts                      # Next + next-intl plugin + image config
├── proxy.ts                            # locale middleware
└── README.md
```

## How The System Works

### 1. Routing and Localization

- Root path (`/`) redirects to `/en`.
- `proxy.ts` applies locale routing middleware to non-API routes.
- `i18n.ts` resolves requested locale and loads `messages/{locale}.json`.
- Locale pages run under `app/[locale]/...`.

### 2. Public Portfolio Flow

1. User opens `/en` or `/th`.
2. `app/[locale]/page.tsx` renders:
   - `SiteNavbar`
   - `LandingIntroClient`
   - `ProjectsSection`
   - `ArchitectureSection`
   - `SiteFooter`
   - `FloatingChatButton`
3. `LandingIntroClient` requests `GET /api/content?locale=...` via `adminApi.getPublicContent`.
4. API response is mapped into:
   - Hero content (`ownerName`, `subtitle`, `about`)
   - Skills list (`technical[]`)
5. If API fails, components fall back to translation-based content.

### 3. Animation Layer

- `AOSProvider` initializes AOS once on client load.
- Sections/cards use `data-aos` attributes for fade/zoom reveals.
- Config defaults: `duration: 700`, `easing: ease-out-cubic`, `offset: 70`, `once: true`.

### 4. Admin Authentication Flow

1. Admin opens `/{locale}/admin/login`.
2. `LoginForm` sends credentials to `POST /api/admin/login`.
3. API route validates credentials (`lib/admin-auth.ts`) and sets `bo_session` cookie.
4. If backend returns bearer token, it is stored in `localStorage` by `lib/admin-api.ts`.
5. Backoffice screens call `GET /api/admin/me` for session verification.
6. On invalid session (`401`), UI clears token and redirects to login.

### 5. Backoffice Content Management Flow

`BackofficePanel` is the main orchestrator for admin state and actions:

- Load data:
  - `GET /api/admin/content?locale=...`
  - `GET /api/admin/technical?locale=...`
- Save portfolio/project content:
  - `PUT /api/admin/content?locale=...`
- Manage technical items:
  - `POST /api/admin/technical`
  - `DELETE /api/admin/technical/:id`
- Upload assets:
  - `POST /api/admin/upload` (single/multiple files)

Before saving, content is sanitized in the client:

- Invalid/non-HTTP URLs are removed
- Project image arrays are normalized
- Technical icon URL is normalized

### 6. API Client Behavior

`lib/admin-api.ts` centralizes Axios behavior:

- Shared `baseURL` from `NEXT_PUBLIC_API_BASE_URL`
- `withCredentials: true` for cookie session support
- Request interceptor adds `Authorization: Bearer <token>` for `/api/admin/*` endpoints when token exists
- Provides typed methods for auth, content, technical items, history, publish, upload, and public data

## Backend Contract

The frontend expects backend endpoints documented in:

- `docs/backoffice-api-requirements.md`

Minimum required endpoints include:

- Auth/session: `/api/admin/login`, `/api/admin/logout`, `/api/admin/me`
- Content: `/api/admin/content`, `/api/content`
- Technical: `/api/admin/technical`, `/api/admin/technical/:id`
- Upload: `/api/admin/upload`
- Optional: `/api/admin/content/publish`, `/api/admin/content/history`, `/api/health`, `/api/chat/ws`

## Scripts

- `npm run dev` - start development server
- `npm run build` - build production bundle
- `npm run start` - run production server
- `npm run lint` - run ESLint

## Notes

- Update `BACKOFFICE_SESSION_SECRET` and admin credentials before deploying.
- The current image allowlist in `next.config.ts` includes `lh3.googleusercontent.com`; add your CDN domains when needed.
- This frontend can run with mock/static translations, but full admin workflows require backend APIs.
