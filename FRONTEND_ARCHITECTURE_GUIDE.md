# HireMe Frontend Architecture Guide (Intern-Friendly)

This guide explains **how this Next.js frontend works end-to-end** so you can contribute safely even if you only worked on smaller React apps before.

---

## 1) What this project is

HireMe is a role-based hiring frontend built with:

- **Next.js App Router** (`app/` directory)
- **React Client Components** (`'use client'` for interactive pages)
- **Tailwind + shadcn/ui primitives** (`components/ui/*`)
- **Axios API layer** (`lib/api/*`)
- **Custom hooks for data operations** (`lib/hooks/*`)
- **Zustand for auth/company local state** (`lib/store.ts`)

The UI supports 3 major user surfaces:

- Public browsing (landing, jobs)
- Candidate dashboard (profile, resumes, applications, apply flow)
- Company dashboard (jobs, applications, members, question banks, settings)

---

## 2) Folder mental model

## `app/`

This is your route tree. In App Router, each `page.tsx` is a route.

- `app/page.tsx` → `/`
- `app/jobs/page.tsx` → `/jobs`
- `app/jobs/[jobId]/page.tsx` → `/jobs/:jobId`

Route groups are used to organize UI shells:

- `app/(auth)/*` for login/register shell
- `app/(candidate)/*` for candidate pages
- `app/(company)/[companyId]/*` for company dashboard pages

### Why route groups matter

`(auth)`, `(candidate)`, `(company)` do **not** appear in URL. They only group layouts and files.

---

## `components/`

- `components/ui/*`: low-level reusable design primitives (Button, Card, Select, etc.)
- `components/shared/*`: cross-page components (Navbar, Sidebar, Pagination, EmptyState, modals)
- feature components (`components/auth/*`, `components/jobs/*`, `components/applications/*`)

Rule of thumb:

- If a component is generic and reusable across domains, put it in `shared` or `ui`.
- If it is domain-specific, keep it in feature folders.

---

## `lib/api/`

Thin wrappers over backend endpoints. Each function maps to one backend route.

Example: `lib/api/applications.ts`

- `apply()` → `POST /v1/candidate/applications`
- `listCandidateApplications()`
- `withdraw()`
- company-side review/comment endpoints

Keep this layer pure (request/response only), no UI logic.

---

## `lib/hooks/`

Custom hooks orchestrate async UI state:

- loading
- error
- data
- mutation wrappers

They call `lib/api/*` and are used directly by pages/components.

Pattern used everywhere:

- `useSomethingList()` returns `{ data, loading, error, refetch }`
- `useSomethingMutation()` returns `{ mutate, loading, error }`

---

## `types/index.ts`

Single source of truth for DTOs and entities.
Always add/change types here first before touching page logic.

---

## 3) Data flow in this app

Typical flow:

1. `page.tsx` renders UI and calls a custom hook
2. hook calls API client function
3. API client uses Axios (`lib/api/client.ts`)
4. response returns to hook
5. hook updates component state
6. UI updates (loading/success/error)

For mutations:

1. button/form triggers `mutate(...)`
2. on success: toast + optional redirect + `refetch()`
3. on error: toast error

---

## 4) Auth and session behavior

`lib/store.ts` (Zustand):

- stores token in `localStorage`
- `isAuthenticated` controls gated UX in client
- `hydrate()` restores auth state on app load

Important:

- Because many pages are client components, auth checks are done in UI/hook logic.
- API access is ultimately validated by backend.

---

## 5) Layout system and responsive UX

### Desktop

- Company routes use top `Navbar` + left `Sidebar`.
- Candidate/public pages use top nav-centered layouts.

### Mobile patterns implemented

- Recruiter dashboard has mobile bottom nav in `Sidebar` component.
- Candidate pages now use mobile bottom nav via `components/shared/CandidateBottomNav.tsx`.
- Public job detail has sticky mobile apply CTA.

Always reserve bottom padding (`pb-24`) on pages with fixed mobile bottom bars.

---

## 6) Application flow (newly completed)

Route: `app/jobs/[jobId]/apply/page.tsx`

Implements Stitch-style 4-step flow:

1. Resume Selection
2. Screening Questions (dynamic type-aware fields)
3. Review
4. Success

Technical details:

- Loads job by ID from public jobs API
- Loads candidate resumes from `useResumes`
- Submits using `useApplyToJob`
- Supports `STANDARD`, `QUESTIONNAIRE`, and `VIDEO` modes
- Enforces required question validation before submission

Job detail apply CTA now routes to `/jobs/[jobId]/apply`.

---

## 7) How to add a new feature safely

Use this checklist:

1. **Add/confirm types** in `types/index.ts`
2. **Add API methods** in `lib/api/<domain>.ts`
3. **Add/extend hooks** in `lib/hooks/<domain>.ts`
4. **Build UI page/component** under `app/` and `components/`
5. **Handle loading/empty/error states**
6. **Add toasts + refetch/redirect flow**
7. **Run lint**

Do not skip loading and empty states; this codebase expects polished UX states.

---

## 8) Common conventions in this repository

- Use `Card`, `Badge`, `Button`, `Input`, `Select` from `components/ui/*`
- Use `EmptyState` and `Skeleton` for empty/loading states
- Use `sonner` toasts for user feedback
- Keep pages focused on orchestration, not deeply nested logic
- Prefer custom hooks over inline API calls in components

---

## 9) Debugging guide for interns

If a page is blank or wrong:

1. Check route file exists at expected `app/.../page.tsx`
2. Confirm dynamic params (`[jobId]`, `[companyId]`) are read correctly
3. Verify hook returns data and API endpoint is correct
4. Check browser network tab for failed requests
5. Confirm token exists in `localStorage` if route requires auth
6. Run `npm run lint` and fix TS/ESLint errors first

---

## 10) Quick command cheatsheet

From `hireme/` folder:

- `npm install`
- `npm run dev`
- `npm run lint`
- `npm run build`

---

## 11) What remains intentionally separate

The design system file includes component-library screens (notifications/loaders/reference) that are **design references**, not standalone app routes.

In this repo, those are implemented as reusable primitives and in-place page states instead of dedicated pages.

---

## 12) Final architecture summary

Think in layers:

- **Routes/UI layer** (`app/*`, `components/*`)
- **Stateful data hooks** (`lib/hooks/*`)
- **API transport layer** (`lib/api/*`)
- **Shared domain contracts** (`types/index.ts`)

If you keep feature code aligned with these layers, your changes will stay consistent and easy to review.
