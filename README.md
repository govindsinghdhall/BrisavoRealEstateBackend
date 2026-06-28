# RealEstate Backend

Multi-tenant SaaS API for the RealEstate CRM admin app and public property websites.

## Architecture

```
┌─────────────────────┐     ┌─────────────────────┐
│  RealEstate CRM     │     │  Public Website     │
│  (React, :5173)     │     │  (React, :5175)     │
└──────────┬──────────┘     └──────────┬──────────┘
           │ JWT                        │ API key (future)
           ▼                            ▼
┌──────────────────────────────────────────────────────┐
│              RealEstate Backend (:3000)              │
│  Express + TypeScript + MongoDB (Mongoose)           │
│                                                      │
│  /api/v1/auth/*          — login, signup, me         │
│  /api/v1/users/*         — team members (per org)    │
│  /api/v1/organizations/* — tenant branding/settings  │
│  /api/v1/roles/*         — RBAC roles per org        │
│  /api/v1/public/*        — website feeds (planned)   │
└──────────────────────────────┬───────────────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │      MongoDB        │
                    │  organizations      │
                    │  users, roles       │
                    │  leads, contacts... │
                    └─────────────────────┘
```

## Multi-tenant SaaS model

Every **signup creates a new organization** (tenant):

1. User submits signup on the CRM (`POST /api/v1/auth/register`)
2. Backend creates an `Organization` with a unique slug
3. Default **roles** are provisioned: `admin`, `manager`, `agent`, `viewer`
4. Default **lead sources** are provisioned: Website, Walk-in, Referral, etc.
5. The signing-up user becomes the **org admin**
6. JWT includes `organizationId` — all data is scoped per tenant

Each organization can later power its own public website via org-scoped public endpoints (planned).

## Project structure

```
src/
├── config/          # env, database
├── constants/       # permissions, role templates
├── controllers/     # HTTP handlers
├── middleware/      # auth, validation, errors
├── models/          # Mongoose schemas
├── routes/          # Express routers
├── scripts/         # seed, migrations
├── services/        # business logic
├── types/           # shared TS types
└── utils/           # jwt, password, responses
```

## Quick start

### 1. Prerequisites

- Node.js 20+
- MongoDB running locally (or Atlas URI)

### 2. Install

```bash
# From repo root (installs frontend + backend)
npm run setup
```

Or manually:

```bash
npm install
npm install --prefix RealEstateBackend
cp RealEstateBackend/.env.example RealEstateBackend/.env
```

### 3. Run

From the **repo root**:

```bash
npm run db:up      # MongoDB + Mongo Express
npm run dev:all    # API (:3000) + CRM (:5173)
```

Or from this folder only:

```bash
npm run dev
```

API base URL: `http://localhost:3000/api/v1`

### 4. Connect the CRM frontend

Root `.env` (already set by setup):

```
VITE_API_BASE_URL=/api/v1
```

Vite proxies `/api` → `http://localhost:3000` in development.

## Auth endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/register` | Sign up → new org + admin user |
| POST | `/auth/login` | Login with email/password |
| POST | `/auth/logout` | Logout (client clears token) |
| GET | `/auth/me` | Returns `{ userId }` for session restore |

### Register body

```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@acme.com",
  "password": "SecurePass1",
  "phone": "+91 98765 43210"
}
```

### Response envelope

All endpoints return:

```json
{
  "success": true,
  "message": "Login successful",
  "data": { "user": {}, "accessToken": "..." }
}
```

## Demo account

On first startup, a demo tenant is seeded:

- **Email:** `admin@realestatecrm.com`
- **Password:** `Admin@123`

## What's implemented now

- Multi-tenant organization provisioning on signup
- JWT authentication
- Users CRUD (scoped to organization)
- Roles listing (per organization)
- Organization profile (`GET/PATCH /organizations/current`)
- Permission-based middleware for future modules

## Planned next

- Leads, Contacts, Properties modules
- Public website API (`/public/properties`, `/public/inquiries`)
- File uploads for org logo/favicon
- Dashboard & reports aggregations
# BrisavoRealEstateBackend
