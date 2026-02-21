# Medius Production Platform Plan

## Current State Assessment

- **Framework**: Next.js 16.1.6, React 19, TypeScript 5.9
- **Database**: SQLite via Prisma + libsql adapter (not production-grade)
- **Auth**: Mock only — hardcoded demo users, no real sessions/tokens
- **API**: ~15 CRUD routes, no auth middleware, no validation schemas, no rate limiting
- **Frontend**: ~25 pages, 11 locales, UI component library, copilot drawer
- **AI Agents**: 10 agent classes (capture, risk, compliance, etc.) — framework only
- **Tests**: None
- **CI/CD**: None
- **Docker**: None
- **Caching**: None
- **Monitoring**: None

---

## Phase 1: Security & Auth Foundation

### 1.1 — Authentication System (NextAuth.js v5)
- Install `next-auth@5` with credentials + OAuth providers
- JWT session strategy with secure cookie handling
- Password hashing with bcrypt, stored in DB
- Add `passwordHash`, `emailVerified`, `accounts`, `sessions` tables to Prisma schema
- Login/register pages with proper form validation
- Email verification flow
- Password reset flow
- Session management (list active sessions, revoke)

### 1.2 — Authorization & RBAC Middleware
- Create `src/lib/middleware/auth.ts` — verify session on every API route
- Role-based guards: `withAuth(handler, { roles: ['ADMIN'] })`
- Tenant isolation middleware — every query scoped to `tenantId`
- Create `src/middleware.ts` (Next.js edge middleware) for route protection
- CSRF protection via `next-auth` built-in double-submit cookie

### 1.3 — API Security Hardening
- Install `zod` for request body/query validation on all API routes
- Rate limiting middleware (`src/lib/middleware/rate-limit.ts`) using in-memory + Redis
- Security headers via `next.config.ts` (CSP, HSTS, X-Frame-Options, etc.)
- Input sanitization to prevent XSS
- SQL injection prevention (already handled by Prisma ORM)
- API key authentication for external integrations (`x-api-key` header)
- Audit log every mutation (create/update/delete) automatically

---

## Phase 2: Database & Infrastructure

### 2.1 — PostgreSQL Migration
- Switch Prisma datasource from `sqlite` to `postgresql`
- Add proper indexes, unique constraints, cascading deletes
- Add `createdBy`, `updatedBy` tracking fields to key models
- Add soft-delete (`deletedAt`) to Tenant, User, Invoice, TradingPartner
- Database connection pooling configuration
- Seed script (`prisma/seed.ts`) with realistic demo data

### 2.2 — Caching Layer (Redis)
- Install `ioredis`
- Create `src/lib/cache.ts` — unified cache interface
- Cache strategies:
  - **Dashboard KPIs**: 30s TTL, revalidate on mutation
  - **User session data**: 15m TTL
  - **Tenant settings**: 5m TTL
  - **Report results**: 10m TTL
  - **API rate limit counters**: sliding window
- Cache invalidation on writes via Prisma middleware

### 2.3 — Docker & Deployment
- `Dockerfile` (multi-stage: build + production)
- `docker-compose.yml` (app + postgres + redis)
- `.env.example` with all environment variables documented
- Health check endpoint (`/api/health`)
- Graceful shutdown handling

---

## Phase 3: Admin Portals

### 3.1 — Super Admin Portal (`/admin`)
- **Tenant Management**: List/create/edit/suspend tenants, plan management
- **User Management**: Cross-tenant user admin, impersonation, force password reset
- **System Monitoring**: API usage, error rates, active sessions, queue depths
- **Feature Flags**: Toggle features per tenant/plan
- **Billing & Plans**: Plan limits, usage metering
- **Audit Logs**: Global audit log viewer with filters
- Layout: Separate admin layout with its own sidebar/navigation

### 3.2 — Tenant Admin Portal (`/settings/admin`)
- **User Management**: Invite users, assign roles, deactivate accounts
- **Approval Workflows**: Configure multi-step approval chains with conditions
- **Integration Settings**: ERP connections, webhooks, API keys
- **Branding**: Logo, colors, email templates
- **Expense Policies**: Category limits, receipt requirements, auto-approval rules
- **Notification Preferences**: Email/in-app notification configuration
- **Data Export**: CSV/PDF export of any entity

### 3.3 — Supplier Portal (`/supplier-portal`)
- Separate auth flow for suppliers (email/token-based)
- Invoice submission portal
- Payment status tracking
- Dispute management
- Document upload
- Self-service profile management
- SCF program enrollment

---

## Phase 4: API Enhancements

### 4.1 — API Architecture
- Create `src/lib/api/` helpers:
  - `withValidation(schema)` — Zod validation wrapper
  - `withAuth(handler, options)` — Auth + role check
  - `withTenant(handler)` — Tenant scoping
  - `withPagination(handler)` — Standardized pagination
  - `withAudit(handler, entityType)` — Auto audit logging
- Composable: `withAuth(withValidation(schema)(withAudit(handler, 'Invoice')), { roles: ['ADMIN', 'AP_CLERK'] })`

### 4.2 — Missing API Endpoints
- `POST /api/auth/login` / `POST /api/auth/register` / `POST /api/auth/refresh`
- `GET/POST /api/notifications` — Mark read, bulk dismiss
- `POST /api/invoices/[id]/process` — Trigger AI agent pipeline
- `POST /api/invoices/bulk` — Bulk operations (approve, reject, pay)
- `GET /api/analytics/spend` — Spend analysis with date ranges
- `GET /api/analytics/processing` — Processing metrics
- `POST /api/export` — CSV/PDF export for any entity
- `POST /api/webhooks` — Webhook management (create, test, delete)
- `GET /api/health` — System health check
- `GET /api/audit-logs` — Audit trail with filters

### 4.3 — Webhook System
- Webhook registration per tenant
- Event types: `invoice.created`, `invoice.approved`, `payment.completed`, etc.
- Retry logic with exponential backoff
- Webhook delivery logs
- Signature verification (HMAC-SHA256)

---

## Phase 5: Integrations

### 5.1 — ERP Integration Framework
- Abstract integration interface (`src/lib/integrations/base.ts`)
- Concrete adapters: SAP, Oracle, NetSuite, QuickBooks, Dynamics 365
- Sync engine: bidirectional data sync with conflict resolution
- Field mapping configuration per tenant
- Sync scheduling (cron-based)
- Error handling + retry + dead letter queue

### 5.2 — Payment Gateway Integration
- Abstract payment interface
- Adapters: Stripe, bank ACH, SWIFT/wire
- Virtual card generation (via Marqeta/Stripe Issuing pattern)
- Payment reconciliation

### 5.3 — Document Processing
- OCR integration interface (for invoice capture)
- Email ingestion endpoint (receive invoices via email)
- Supported formats: PDF, XML (UBL/Peppol), EDI

---

## Phase 6: Translations & i18n Completion

### 6.1 — Complete All 11 Locale Files
- Audit `en.json` as source of truth
- Generate complete translations for: de, fr, es, it, pt, sv, da, fi, nl, no
- Add missing keys for all new admin pages, error messages, validation messages
- Add number/currency/date formatting per locale
- RTL support preparation (for future Arabic/Hebrew)

### 6.2 — Backend i18n
- Error messages returned by API in user's locale
- Email templates localized
- PDF report generation in user's locale

---

## Phase 7: Observability & Monitoring

### 7.1 — Logging
- Structured JSON logging (`src/lib/logger.ts`)
- Request ID tracking across API calls
- Log levels: error, warn, info, debug
- Sensitive data redaction in logs

### 7.2 — Error Handling
- Global error boundary component (`src/components/ErrorBoundary.tsx`)
- API error standardization (consistent error response format)
- Unhandled rejection catching
- Error reporting service integration point

### 7.3 — Metrics
- `/api/health` endpoint with DB + Redis connectivity checks
- Processing pipeline metrics (throughput, latency, error rates)
- API response time tracking
- Agent performance metrics collection

---

## Phase 8: Testing

### 8.1 — Unit Tests
- Jest + React Testing Library setup
- Test API route handlers
- Test auth middleware
- Test validation schemas
- Test utility functions

### 8.2 — Integration Tests
- API integration tests with test database
- Auth flow tests
- Multi-tenant isolation tests

### 8.3 — E2E Tests
- Playwright setup
- Critical user flows: login, invoice processing, approval, payment

---

## Implementation Order (What Gets Built Now)

Given scope, I'll implement in this order during this session:

1. **Security foundation** — Real auth, middleware, API protection
2. **Database upgrade** — PostgreSQL schema, seed data
3. **API hardening** — Validation, rate limiting, error handling
4. **Caching layer** — Redis integration
5. **Admin portals** — Super admin + tenant admin pages
6. **Supplier portal** — External supplier access
7. **Webhook system** — Event-driven integrations
8. **Docker** — Containerized deployment
9. **Monitoring** — Health checks, logging, error boundaries
10. **Testing** — Jest + Playwright setup
