# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   └── api-server/         # Express API server
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   ├── assessment-scoring/ # Shared assessment scoring logic (single source of truth)
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts, run via `pnpm --filter @workspace/scripts run <script>`
├── pnpm-workspace.yaml     # pnpm workspace (artifacts/*, lib/*, lib/integrations/*, scripts)
├── tsconfig.base.json      # Shared TS options (composite, bundler resolution, es2022)
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck` (which runs `tsc --build --emitDeclarationOnly`). This builds the full dependency graph so that cross-package imports resolve correctly. Running `tsc` inside a single package will fail if its dependencies haven't been built yet.
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck; actual JS bundling is handled by esbuild/tsx/vite...etc, not `tsc`.
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array. `tsc --build` uses this to determine build order and skip up-to-date packages.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/universitio` (`@workspace/universitio`)

Universitio marketing website — a UK education consultancy homepage for international students.

- **Stack**: React + Vite, Tailwind CSS v4, wouter routing, framer-motion, react-hook-form
- **Served at**: `/` (preview path root)
- **Pages**: `/` homepage, `/free-consultation`, `/assessment-form`, `/blog`, `/blog/:slug` (article), `/blog/category/:category`, `/partners`, `/student-referral`, `/careers`, `/admin/login`, `/admin` (dashboard), `/admin/consultations`, `/admin/assessments`, `/admin/partners`, `/admin/referrals`, `/admin/messages`, `/admin/blog-import`
- **Brand colour**: #42147d (deep purple) — primary: 266 72% 28%
- **Key components**: `src/components/layout/` (Navbar, Footer), `src/components/home/` (Hero, TrustIndicators, AboutAndServices, GlobalReach, StudyDestinations, Partnerships, SocialProof)
- **Data**: All editable content (stats, services, countries, testimonials, blog posts, study destinations, accreditations) lives in `src/data/siteData.ts`
- **Assets**: Accreditation logos imported via `@assets/` alias from `attached_assets/`
- **ICEF badge**: Injected via `useEffect` in Footer using account ID 6539 — renders live badge
- **SEO**: Full meta tags, Open Graph, Twitter Card, structured data (LD+JSON) in `index.html`
- **Blog**: 252 WordPress posts imported from XML, stored in `src/data/blog/postsData.ts` and `categoriesData.ts`. 43 royalty-free Unsplash images stored in `public/blog-images/`. 20 categories. Blog index with category filter pills, featured article hero, Load More pagination. Article pages with Tailwind Typography prose rendering, breadcrumbs, share links, related posts. Category pages with filtered grids. Build scripts: `scripts/parse-wordpress-xml.mjs`, `scripts/download-blog-images.mjs`
- **Admin Panel**: JWT-authenticated admin panel at `/admin/*` with sidebar navigation, route guard (`AdminGuard`), and auth context (`AdminAuthContext`). Pages: dashboard (stats + recent), consultations, assessments, partners, referrals, contact messages (all with list/detail/status-update/delete views + CSV export), blog import (ZIP upload). Auth stored in localStorage (`admin_token`, `admin_email`). Sidebar has unread notification badges per section (polled every 60s from `/api/admin/stats/unread`). Shared `DeleteDialog` component for confirmation modals.
- **API Integration**: All frontend forms (consultation, assessment, partners, referral) submit to real API endpoints via `/api` proxy. Vite dev server proxies `/api` to `http://localhost:8080`. API helper in `src/lib/api.ts` provides `apiFetch` (with auto-token and 401 redirect) and `apiUrl` (URL builder).
- Dev: `pnpm --filter @workspace/universitio run dev`

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/` and use `@workspace/api-zod` for request and response validation and `@workspace/db` for persistence.

- Entry: `src/index.ts` — reads `PORT`, starts Express
- App setup: `src/app.ts` — mounts CORS, JSON/urlencoded parsing, routes at `/api`
- Routes: `src/routes/index.ts` mounts sub-routers:
  - `src/routes/health.ts` — `GET /api/healthz`
  - `src/routes/auth.ts` — `POST /api/admin/auth/login`, `GET /api/admin/auth/me`
  - `src/routes/leads.ts` — `POST /api/leads/consultation`, `/assessment`, `/partners`, `/referral`, `/contact`
  - `src/routes/admin.ts` — Admin CRUD + DELETE for all lead types (consultations, assessments, partners, referrals, messages), stats, stats/unread, recent, blog-import (protected by JWT)
- Auth: JWT-based admin auth in `src/middleware/auth.ts`; credentials default to `info@universitio.com` / `Universitio2002@` (env: ADMIN_EMAIL, ADMIN_PASSWORD, JWT_SECRET)
- Depends on: `@workspace/db`, `@workspace/api-zod`, `jsonwebtoken`, `multer`, `adm-zip`
- `pnpm --filter @workspace/api-server run dev` — run the dev server
- `pnpm --filter @workspace/api-server run build` — production esbuild bundle (ESM `dist/index.js`); copies `knowledge_base.json`, `vector_store.json`, `approved_kb_entries.json` to `dist/`
- Build bundles an allowlist of deps (express, cors, pg, drizzle-orm, zod, etc.) and externalizes the rest

#### AskiMate AI KB & Human-in-the-Loop Workflow

- **AI KB endpoint**: `POST /api/askimate/ai` — semantic retrieval (OpenAI) with BM25 fallback; returns `{answer, sources, reviewLevel, needsHumanReview, mode}`
- **Risk levels**: `safe_auto` (auto-approved allowlist) | `cautious_auto` | `escalate_human` (visa/bank topics or keyword matches)
- **Chat route integration**: `POST /api/askimate/chat` calls `generateAiAnswer()` per user message; stores real AI answer + metadata (reviewLevel, sources, aiAttempt) on the AI message row; if `escalate_human`, user sees a hold-on message but admin sees the AI attempt
- **Logs**: `[AITL] ESCALATE`, `[AITL] MENTOR_REPLY`, `[AITL] KB_APPROVED` structured log lines
- **KB approval storage**: `src/ai/approved_kb_entries.json` (JSON array, `status: "pending_ingest"` → `"ingested"`); written by `src/ai/pendingKbManager.ts`; admin utility: `npx tsx scripts/readPendingKb.ts`
- **Ingest pipeline**: `scripts/ingestApprovedKb.ts` — controlled manual script; reads pending entries, runs duplicate detection (topSources → Jaccard fallback → new entry), re-embeds affected entries, updates both JSON files, marks as "ingested"; run via `pnpm --filter @workspace/api-server run ingest-kb`
- **Admin UI**: Admin chat view shows review-level badge + sources beneath each AI message; "Approve this reply for Knowledge Base" checkbox on reply form sends `approveForKb + aiContext` to the mentor-reply route
- **Schema**: `askimate_messages.metadata` (JSONB) stores `{reviewLevel, needsHumanReview, sources, aiAttempt}` on AI messages; nullable so old messages are unaffected

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL. Exports a Drizzle client instance and schema models.

- `src/index.ts` — creates a `Pool` + Drizzle instance, exports schema
- `src/schema/index.ts` — barrel re-export of all models
- `src/schema/consultations.ts` — Free Consultation form submissions
- `src/schema/assessments.ts` — Free Admissions Assessment submissions (with score fields)
- `src/schema/partner-requests.ts` — Partner enquiry submissions
- `src/schema/student-referrals.ts` — Student Referral Programme applications
- `src/schema/blog-imports.ts` — Blog import records (ZIP upload history)
- `src/schema/contact-messages.ts` — Contact form submissions from homepage (fullName, email, phone, subject, message, status, notes)
- `drizzle.config.ts` — Drizzle Kit config (requires `DATABASE_URL`, automatically provided by Replit)
- Exports: `.` (pool, db, schema), `./schema` (schema only)

Production migrations are handled by Replit when publishing. In development, we just use `pnpm --filter @workspace/db run push`, and we fallback to `pnpm --filter @workspace/db run push-force`.

### `lib/api-spec` (`@workspace/api-spec`)

Owns the OpenAPI 3.1 spec (`openapi.yaml`) and the Orval config (`orval.config.ts`). Running codegen produces output into two sibling packages:

1. `lib/api-client-react/src/generated/` — React Query hooks + fetch client
2. `lib/api-zod/src/generated/` — Zod schemas

Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from the OpenAPI spec (e.g. `HealthCheckResponse`). Used by `api-server` for response validation.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks and fetch client from the OpenAPI spec (e.g. `useHealthCheck`, `healthCheck`).

### `scripts` (`@workspace/scripts`)

Utility scripts package. Each script is a `.ts` file in `src/` with a corresponding npm script in `package.json`. Run scripts via `pnpm --filter @workspace/scripts run <script>`. Scripts can import any workspace package (e.g., `@workspace/db`) by adding it as a dependency in `scripts/package.json`.
