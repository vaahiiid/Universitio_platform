# Threat Model

## Project Overview

This project is a pnpm monorepo for Universitio, a public education-consultancy website, and AskiMate, an AI-assisted student mentoring product. The production application consists of a React/Vite frontend in `services/universitio` and an Express 5 API in `services/api-server`, backed by PostgreSQL via Drizzle ORM, local file storage for uploaded CVs, and third-party services including Stripe, Google OAuth, OpenAI, and Resend.

Production scope for security scanning includes `services/api-server`, `services/universitio`, and shared libraries they depend on. `services/mockup-sandbox` is treated as dev-only and out of scope unless production reachability is demonstrated. Assume `NODE_ENV=production` in deployed environments. TLS is provided by the platform.

## Assets

- **Admin authentication material and admin sessions** — the admin JWT signing secret, admin credentials, and any privileged bearer tokens protect CRM-style access to all lead records, uploaded CVs, AskiMate user records, and operational actions.
- **Lead and customer PII** — consultation, assessment, partner, referral, contact, and service-request submissions include names, emails, phone numbers, dates of birth, nationality, education history, notes, and uploaded CVs.
- **AskiMate user accounts and chat histories** — password hashes, Google-linked identities, email-verification state, subscription state, conversation metadata, and message contents must remain scoped to the correct user or guest session.
- **Payment state and subscription entitlements** — Stripe checkout metadata, webhook processing, and premium-plan state determine paid access and must not be forgeable or transferable across users.
- **Application secrets and third-party credentials** — database credentials, JWT secrets, Stripe keys, Google OAuth secrets, Resend credentials, and OpenAI keys can all lead to broader compromise if exposed.
- **Operational content and knowledge-base files** — AI knowledge-base JSON files, approved KB entries, and admin-imported data influence answers and internal workflows.

## Trust Boundaries

- **Browser / API boundary** — all frontend state, form input, query params, headers, uploaded files, and localStorage values are attacker-controlled until revalidated server-side.
- **Public / guest / authenticated / admin boundary** — the system exposes public lead routes, guest chat flows, authenticated AskiMate flows, and admin-only CRM routes. Each privilege transition must be enforced on the server, not just in the frontend.
- **API / database boundary** — the API has direct access to all stored PII and chat history. Query scoping and authorization mistakes here expose the entire dataset.
- **API / filesystem boundary** — CV uploads in `uploads/cvs` and other server-side files must not become public simply because a route path looks internal.
- **API / external services boundary** — outbound calls to Stripe, Google OAuth, Resend, and OpenAI rely on secrets and remote responses that must be authenticated, validated, and bounded.
- **Webhook / API boundary** — Stripe webhook traffic is trusted only after signature verification.

## Scan Anchors

- **Production entry points:** `services/api-server/src/index.ts`, `services/api-server/src/app.ts`, `services/api-server/src/routes/*`, `services/universitio/src/main.tsx`, `services/universitio/src/App.tsx`.
- **Highest-risk backend areas:** `services/api-server/src/middleware/auth.ts`, `services/api-server/src/routes/auth.ts`, `services/api-server/src/routes/admin.ts`, `services/api-server/src/routes/leads.ts`, `services/api-server/src/routes/askimate-auth.ts`, `services/api-server/src/routes/askimate-chat.ts`, `services/api-server/src/routes/askimate-stripe-webhooks.ts`, `services/api-server/src/routes/email.ts`.
- **Highest-risk frontend areas:** `services/universitio/src/contexts/AdminAuthContext.tsx`, `services/universitio/src/contexts/AskiMateAuthContext.tsx`, `services/universitio/src/lib/api.ts`, `services/universitio/src/pages/admin/*`, `services/universitio/src/pages/askimate-*`, `services/universitio/src/pages/blog-post.tsx`.
- **Public surfaces:** `/api/leads/*`, `/api/askimate/chat`, public marketing/blog routes.
- **Authenticated/admin surfaces:** `/api/admin/*`, `/api/admin/auth/*`, `/api/askimate/*` authenticated endpoints, Stripe webhook, Google OAuth callback.
- **Usually ignore:** `services/mockup-sandbox/**` unless a production path references it.

## Threat Categories

### Spoofing

The application relies on JWTs for both admin and AskiMate sessions, Google OAuth for optional user login, and Stripe signatures for webhook trust. All privileged routes MUST verify the correct token or signature on the server, secrets MUST come from environment variables rather than production fallbacks, and no admin capability may be granted based solely on route naming or frontend state.

### Tampering

Attackers can submit arbitrary JSON, multipart forms, chat messages, and uploaded files. The backend MUST validate request bodies and file uploads server-side, bind guest chat actions to an unforgeable guest identity rather than a bare numeric identifier, and ensure payment-confirmation flows cannot reassign one user’s successful purchase to another account.

### Information Disclosure

The system stores sensitive lead data, CVs, chat histories, and account metadata. API responses and file-download routes MUST be scoped to the correct authenticated principal or guest session, admin-only data MUST never be exposed through unprotected helper routes, and logs, emails, and rendered content MUST avoid leaking secrets or unsafely rendering attacker-controlled HTML.

### Denial of Service

Public lead endpoints, guest chat, AI calls, uploads, and ZIP imports can all be abused for resource exhaustion. Public routes MUST enforce reasonable size limits, bound expensive operations, and avoid letting unauthenticated users trigger disproportionate AI or file-processing work.

### Elevation of Privilege

The main privilege boundaries are public-to-admin and guest-to-authenticated-user. Every admin endpoint, support utility, download helper, and conversation-management route MUST enforce ownership and role checks server-side. Numeric identifiers, Stripe session IDs, uploaded filenames, or other secondary references MUST not be sufficient to gain access to another user’s data or paid features.
