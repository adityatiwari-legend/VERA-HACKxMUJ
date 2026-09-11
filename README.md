# FundTrail — A Donation Trail Donors Can Audit

> **"A donor should be able to trace where their donated money goes, why it was released, what proof was submitted, and what happened to the funds afterward."**

FundTrail is a transparent donation and fund-tracking platform built for high-trust philanthropy. Fund movement is tracked end-to-end:
```
Donor → Earmarked Donation → Locked Funds → Milestone → Proof → Verification → Approval → Fund Release → Beneficiary Spend → Public Audit Trail
```

FundTrail is being developed in **five deliberate phases**:
- **Phase 1 (CURRENT): Application Foundation & Campaign Management**
- **Phase 2:** Earmarked Donations, Fund Locking & Milestone Allocations
- **Phase 3:** Proof Evidence Uploads, SHA-256 Hashing, AI OCR & Human Verification
- **Phase 4:** Blockchain State Layer & Smart Contracts
- **Phase 5:** Public Audit Trail, Multi-Sig Release, NGO Reputation & Production VPS Deployment

---

## 1. Phase 1 Overview

Phase 1 establishes the production application foundation, authentication, authorization, and PostgreSQL database layer. It provides complete campaign lifecycle management for verified NGOs.

### Implemented in Phase 1:
- ✅ **Next.js 14 (App Router) + TypeScript + Tailwind CSS**
- ✅ **PostgreSQL with native `pg` driver** and direct parameterized SQL (Zero ORMs)
- ✅ **Pure SQL Migrations** (`001_create_users.sql`, `002_create_campaigns.sql`, `003_create_audit_logs.sql`)
- ✅ **User Authentication & Session Management**: Email/password authentication, bcrypt password hashing, and secure signed JWT HTTP-only cookies
- ✅ **Role-Based Authorization (RBAC)**: `NGO`, `DONOR`, `AUDITOR`, `ADMIN` with server-side enforcement
- ✅ **NGO Campaign CRUD**: Create, read, update, status change, and soft cancellation
- ✅ **Campaign Isolation**: Strict tenant boundary preventing an NGO from editing or viewing another NGO's private drafts
- ✅ **Strict Financial Truth**: Raised amount = ₹0, Released amount = ₹0 (no fake financial numbers)
- ✅ **Append-Only Audit Logging**: Every campaign mutation (`CREATE_CAMPAIGN`, `UPDATE_CAMPAIGN`, `CHANGE_CAMPAIGN_STATUS`) is recorded with actor ID, timestamp, and JSON metadata
- ✅ **Interactive NGO Dashboard**: Metrics cards (Total, Active, Draft, Completed), Campaign Directory table, creation form, details page with Phase 2 placeholder, and edit views
- ✅ **Docker & Docker Compose**: Automated multi-container setup with PostgreSQL persistent volume
- ✅ **End-to-End Automated Test Suite**: Verifies all 17 requirements specified in the architecture document

---

## 2. Intentionally NOT Implemented Yet (Phases 2 – 5)

To maintain clean architectural boundaries, the following are strictly deferred:
- ❌ Donations & Payment Gateways (Phase 2)
- ❌ Fund Locking & Escrow Logic (Phase 2)
- ❌ Milestone Configurations (Phase 2)
- ❌ Proof Uploads & Evidence Storage (Phase 3)
- ❌ AI Verification & OCR (Phase 3)
- ❌ Blockchain Contracts / Ethers.js (Phase 4)
- ❌ Multi-Signature Approvals (Phase 4/5)
- ❌ Refund System (Phase 4)
- ❌ Public Donor Audit Trail Explorer (Phase 5)

---

## 3. Technology Stack

- **Framework**: Next.js 14 (App Router, Server Components & Route Handlers)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (Fintech / trust-oriented palette)
- **Database**: PostgreSQL 16
- **Database Driver**: `pg` (Native PostgreSQL Connection Pool)
- **Security & Auth**: `bcryptjs` (Password hashing), `jose` (Signed JWT session cookies)
- **Validation**: `zod` (Strict server-side input schema validation)
- **Containerization**: Docker & Docker Compose

> [!IMPORTANT]
> **No ORM Rule**: As per system architecture, Prisma, Drizzle, Sequelize, and TypeORM are not used. All database interactions execute parameterized SQL queries to prevent SQL injection and overhead.

---

## 4. Architecture

```text
Browser
   ↓
Next.js 14 (Port 3000)
   ├── UI & Server Components
   ├── API Route Handlers
   ├── Session Authentication (HTTP-only cookies)
   └── Direct SQL Service Layer
          ↓
       PostgreSQL (pg pool)
          ├── users
          ├── campaigns
          └── audit_logs
```

---

## 5. Prerequisites

- **Node.js**: v18+ (tested on Node v20 and v24)
- **npm**: v9+
- **Docker & Docker Compose**

---

## 6. Environment Variables

Create `.env.local` for local development by copying `.env.example`:

```bash
cp .env.example .env.local
```

### Configuration:
```env
# PostgreSQL connection string
# Docker maps fundtrail-db to localhost:5433 to avoid conflict with host postgres on 5432:
DATABASE_URL=postgresql://postgres:postgrespassword@localhost:5433/fundtrail

# JWT Secret for session signing (minimum 32 characters)
JWT_SECRET=fundtrail-super-secret-jwt-key-for-development-32chars!

# Base application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional SQL query logging
DEBUG_SQL=false
```

---

## 7. Quickstart via Docker Compose

To start both the PostgreSQL database and the Next.js application in Docker:

```bash
# 1. Build and run containers
docker compose up -d --build

# 2. Run migrations inside the database
npm run db:migrate

# 3. Seed demo accounts and initial campaigns
npm run db:seed
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 8. Local Development Setup (Outside Docker)

If running the Next.js app locally on your machine while running PostgreSQL in Docker:

```bash
# 1. Install dependencies
npm install

# 2. Start PostgreSQL container only (runs on host port 5433)
docker compose up -d fundtrail-db

# 3. Run database migrations
npm run db:migrate

# 4. Seed development users & demo campaigns
npm run db:seed

# 5. Start Next.js development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

---

## 9. Demo Credentials

Pre-seeded accounts for testing and verification (Password for all: `Password123!`):

| Role | Email | Purpose |
|---|---|---|
| **NGO** | `ngo@fundtrail.org` | Campaign creation, editing, and status management |
| **Donor** | `donor@fundtrail.org` | Role verification (access restricted in Phase 1) |
| **Auditor** | `auditor@fundtrail.org` | Role verification (verification activates in Phase 3) |

---

## 10. Running Automated Tests

Run the full Phase 1 verification test suite:

```bash
npm run test:phase1
```

This runs 17 automated checks:
1. Password hashing (bcrypt verification, no plain text)
2. JWT session creation and verification
3. User persistence in PostgreSQL
4. Multi-tenant user isolation
5. Zod server-side validation (negative targets, zero targets, short titles rejected)
6. Campaign creation with strictly ₹0 raised and ₹0 released
7. Campaign detail queries with joined NGO metadata
8. Campaign updates and mutable field changes
9. Status transitions (`DRAFT` → `ACTIVE` → `PAUSED`)
10. Rejection of invalid status transitions (e.g. `DRAFT` directly to `COMPLETED`)
11. Append-only audit logging with actor attribution and JSON metadata
12. Cross-tenant authorization (NGO 2 blocked from editing NGO 1's campaigns with 403)
13. Cross-role protection (Donor blocked from managing campaigns)
14. Database connection resilience

---

## 11. Database Schema

### `users`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY, gen_random_uuid() | Unique user identifier |
| `name` | VARCHAR(255) | NOT NULL | User or organization name |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Login email address |
| `password_hash` | VARCHAR(255) | NOT NULL | Bcrypt hash |
| `wallet_address`| VARCHAR(255) | NULLABLE | Phase 4 Web3 wallet |
| `role` | VARCHAR(50) | CHECK (role IN ('DONOR', 'NGO', 'AUDITOR', 'ADMIN')) | Role for RBAC |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Timestamp |

### `campaigns`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY, gen_random_uuid() | Campaign ID |
| `ngo_id` | UUID | REFERENCES users(id) ON DELETE RESTRICT | Owning NGO |
| `title` | VARCHAR(255) | NOT NULL | Campaign name |
| `description` | TEXT | NOT NULL | Project description |
| `target_amount` | NUMERIC(14,2)| CHECK (target_amount > 0) | Funding goal (INR ₹) |
| `raised_amount` | NUMERIC(14,2)| DEFAULT 0.00, CHECK (raised_amount >= 0) | Total collected (₹0 in Phase 1) |
| `released_amount`| NUMERIC(14,2)| DEFAULT 0.00, CHECK (released_amount >= 0) | Total disbursed (₹0 in Phase 1) |
| `beneficiary` | VARCHAR(255) | NOT NULL | Recipient group |
| `status` | VARCHAR(50) | CHECK (status IN ('DRAFT','ACTIVE','PAUSED','COMPLETED','CANCELLED')) | Current state |
| `blockchain_campaign_id` | VARCHAR(255) | NULLABLE | Phase 4 contract mapping |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Timestamp |

### `audit_logs`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY, gen_random_uuid() | Log ID |
| `campaign_id` | UUID | REFERENCES campaigns(id) ON DELETE SET NULL | Targeted campaign |
| `actor_id` | UUID | REFERENCES users(id) ON DELETE RESTRICT | User performing mutation |
| `action` | VARCHAR(100) | NOT NULL | E.g. `CREATE_CAMPAIGN`, `UPDATE_CAMPAIGN` |
| `entity_type` | VARCHAR(100) | NOT NULL | E.g. `CAMPAIGN` |
| `entity_id` | UUID | NOT NULL | ID of mutated entity |
| `metadata` | JSONB | DEFAULT '{}'::jsonb | Changes / audit details |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Timestamp |

---

## 12. Project Directory Structure

```text
fundtrail/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (public)/
│   │   └── page.tsx
│   ├── dashboard/
│   │   └── page.tsx
│   ├── ngo/
│   │   └── campaigns/
│   │       ├── page.tsx
│   │       ├── new/page.tsx
│   │       └── [id]/
│   │           ├── page.tsx
│   │           ├── edit/page.tsx
│   │           └── CampaignStatusActions.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   ├── register/route.ts
│   │   │   ├── logout/route.ts
│   │   │   └── me/route.ts
│   │   └── campaigns/
│   │       ├── route.ts
│   │       └── [id]/
│   │           ├── route.ts
│   │           └── status/route.ts
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── Navbar.tsx
│   ├── StatusBadge.tsx
│   └── StatCard.tsx
├── lib/
│   ├── db.ts               # PostgreSQL Pool & parameterized queries
│   ├── auth.ts             # Bcrypt hashing & JWT session management
│   ├── permissions.ts      # Role-based authorization guards
│   ├── validation.ts       # Zod validation schemas
│   ├── campaigns.ts        # Direct SQL campaign services
│   └── audit.ts            # Audit logging service
├── db/
│   ├── migrations/
│   │   ├── 001_create_users.sql
│   │   ├── 002_create_campaigns.sql
│   │   └── 003_create_audit_logs.sql
│   ├── schema.sql          # Consolidated schema
│   └── seed.sql            # Seed SQL file
├── scripts/
│   ├── migrate.ts          # Migration runner
│   ├── seed.ts             # Demo data seeder
│   └── test-phase1.ts      # Comprehensive test suite
├── types/
│   └── index.ts            # TypeScript interfaces
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── .env.local
└── package.json
```
