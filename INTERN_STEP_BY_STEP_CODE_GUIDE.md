# Intern Step-by-Step Code Guide (Next.js Beginner Friendly)

This guide is a **reading order** for understanding the project without getting overwhelmed.

Use this method:
1. Read one flow at a time.
2. Open the files in the exact order listed.
3. For each file, first understand **inputs**, then **main logic**, then **outputs/UI**.

---

## 0) First 25 Minutes: Understand Project Shape

Read these files in order:

1. `types/index.ts`
   - Learn core enums + entities: `ApplicationMode`, `ApplicationStatus`, `JobListing`, `CandidateApplication`, `CompanyApplicationDetail`, `Resume`, `CompanyMember`.
   - Also scan request DTOs (`CreateJobDto`, `ApplyToJobDto`, etc.) so API payloads make sense later.

2. `lib/api/client.ts`
   - Understand Axios base URL, token injection, 401 handling, and **GET request deduplication**.

3. `lib/store.ts`
   - Learn Zustand stores:
     - `useAuthStore` (`hydrate`, `login`, `logout`, profile cache)
     - `useCompanyStore` (`activeCompanyId`, persistence in localStorage)

4. `components/shared/AuthHydration.tsx`
   - See how auth/company state is restored on app load.
   - Also loads candidate profile into store after auth hydration.

5. `app/layout.tsx`
   - Root shell: global styles, `AuthHydration`, global `Toaster`.

6. `components/shared/Navbar.tsx`
   - Global navigation logic, company switcher, profile menu, saved jobs integration.

After this, you know: **data shapes + HTTP layer + global state + app boot flow + top-level navigation**.

---

## 1) Flow A — Auth (Register/Login) End-to-End

### Goal
Understand how users register, log in, and get hydrated auth state.

### Read in this order

1. `lib/api/auth.ts`
   - `register` and `login` endpoints.

2. `lib/hooks/useAuth.ts`
   - `useRegister`, `useLogin`, and `loadProfileIntoStore`.
   - Note: login stores token + fetches profile.

3. `components/auth/RegisterForm.tsx`
   - Client validation + register mutation.

4. `components/auth/LoginForm.tsx`
   - Client validation + login mutation + redirect (`next` query fallback to `/jobs`).

5. `app/(auth)/register/page.tsx`
6. `app/(auth)/login/page.tsx`
7. `app/(auth)/layout.tsx`
   - Redirects authenticated users away from auth pages.

8. `components/shared/AuthHydration.tsx` (revisit)
   - Hydration + profile-load behavior.

### Mental model
UI form → hook (`useAuth`) → API (`authApi`) → store (`useAuthStore`) → hydration keeps session alive.

---

## 2) Flow B — Public Experience (Landing + Browse + Job Detail)

### Goal
Understand the public-facing candidate discovery journey.

### Read in this order

1. `app/page.tsx`
   - Marketing landing page.

2. `app/jobs/page.tsx`
   - Main browse page.
   - Uses `usePublicJobs`, client-side search/location filters, pagination.
   - Also directly calls `applicationsApi.listCandidateApplications` to mark already-applied jobs.

3. `lib/hooks/useJobs.ts`
   - `usePublicJobs` hook.

4. `lib/api/jobs.ts`
   - `browsePublic`, `getPublicJobById`.

5. `components/jobs/JobCard.tsx`
   - Public card rendering and applied state visuals.

6. `app/jobs/[jobId]/layout.tsx`
   - Shared navbar/footer wrapper for job detail/apply routes.

7. `app/jobs/[jobId]/page.tsx`
   - Job detail screen.
   - Handles apply CTA states (unauthenticated, already applied, closed job), save job behavior (localStorage), and query flags like `status=closed` / `already_applied=true`.

### Mental model
Public jobs API + auth-aware checks → list/detail UI → conditional CTA to apply/login/applications.

---

## 3) Flow C — Apply to Job (Step-Based Wizard)

### Goal
Understand the complete application journey from `/jobs/[jobId]/apply`.

### Read in this order

1. `app/jobs/[jobId]/apply/page.tsx`
   - Page orchestration for steps, skeletons, redirects.
   - Forces profile completion (`/profile?returnTo=...`) before applying.

2. `app/jobs/[jobId]/apply/_components/useApplyToJobFlow.ts`
   - Core wizard state machine and validation.
   - Handles:
     - existing-application check
     - closed-job redirect
     - step transitions
     - final payload submit

3. `app/jobs/[jobId]/apply/_components/ApplyStepContent.tsx`
4. `app/jobs/[jobId]/apply/_components/ApplyStepIndicator.tsx`
5. `app/jobs/[jobId]/apply/_components/ScreeningQuestionsForm.tsx`
   - UI rendering for resume step, questionnaire/video step, review, success.

6. `lib/hooks/useApplications.ts`
   - `useApplyToJob`.

7. `lib/api/applications.ts`
   - `apply` endpoint.

8. `types/index.ts` (revisit)
   - `ApplyToJobDto`, `Question`, `ApplicationMode`.

### What to focus on
- Mode-driven steps (`STANDARD`, `QUESTIONNAIRE`, `VIDEO`).
- Validation logic per step.
- Final payload shape from selected resume + answers/video.

---

## 4) Flow D — Candidate Area (Profile, Resumes, Applications)

### Goal
Understand candidate-side CRUD and status tracking.

### D0: Candidate shell first
1. `app/(candidate)/layout.tsx`
2. `components/shared/CandidateBottomNav.tsx`

### D1: Profile
1. `lib/api/candidate.ts` (`getProfile`, `createProfile`, `updateProfile`)
2. `lib/hooks/useCandidate.ts` (`useProfile`, `useCreateProfile`, `useUpdateProfile`)
3. `app/(candidate)/profile/page.tsx`
   - Supports create mode, edit mode, and `returnTo` redirects.

### D2: Resumes (multipart upload + signed download)
1. `lib/api/candidate.ts` (`uploadResume`, `listResumes`, `downloadResume`, `setResumePrimary`, `deleteResume`)
2. `lib/hooks/useCandidate.ts` (`useResumes`, `useUploadResume`, `useDownloadResume`, `useSetResumePrimary`, `useDeleteResume`)
3. `app/(candidate)/resumes/page.tsx`
   - Upload dialog, primary toggle, delete constraints, signed download open.

### D3: Applications list + withdraw
1. `app/(candidate)/applications/page.tsx`
   - Note: this page currently calls `applicationsApi.listCandidateApplications` directly (not `useCandidateApplications`).
2. `app/(candidate)/applications/_components/CandidateApplicationCard.tsx`
3. `lib/hooks/useApplications.ts` (`useWithdrawApplication`)
4. `lib/api/applications.ts` (`listCandidateApplications`, `withdraw`)

### Mental model
Candidate layout guard → profile/resume/application pages → hooks/API mutations + optimistic-ish UI updates.

---

## 5) Flow E — Company Area (Recruiter/Team Side)

### Goal
Understand recruiter-side company management end-to-end.

> Important route note: company pages live under `app/(company)/companies/[companyId]/...`

### E0: Create/select company
1. `app/(company)/companies/new/page.tsx`
2. `lib/hooks/useCompany.ts` (`useCreateCompany`, `useMyCompanies`)
3. `lib/store.ts` (`useCompanyStore`)

### E1: Company shell + navigation
1. `app/(company)/companies/[companyId]/layout.tsx`
2. `components/shared/Sidebar.tsx`
3. `components/shared/Navbar.tsx` (company switch behavior)

### E2: Company dashboard overview
1. `app/(company)/companies/[companyId]/page.tsx`
   - Aggregated metrics from jobs + applications hooks.

### E3: Jobs management
1. `lib/api/jobs.ts`
2. `lib/hooks/useJobs.ts`
3. `app/(company)/companies/[companyId]/jobs/page.tsx`
4. `app/(company)/companies/[companyId]/jobs/new/page.tsx`
5. `app/(company)/companies/[companyId]/jobs/[jobId]/page.tsx`
   - Includes status transitions + question bank snapshot selection behavior.

### E4: Applications review (with resume download + candidate profile)
1. `lib/api/applications.ts` (`listCompanyApplications`, `getCompanyApplicationDetail`, `updateStatus`, `addComment`, `listComments`, `getApplicationResume`)
   - `getCompanyApplicationDetail(companyId, applicationId)` is a **standalone export** (not inside `applicationsApi`). It is called when the modal opens to fetch the full per-application detail, including `candidate_name`, `candidate_phone`, `candidate_linkedin_url`, and `candidate_portfolio_url`.
2. `lib/hooks/useApplications.ts` (`useCompanyApplications`, `useComments`, `useUpdateApplicationStatus`, `useAddComment`, `useApplicationResumeDownload`)
3. `app/(company)/companies/[companyId]/applications/page.tsx`
4. `app/(company)/companies/[companyId]/applications/_components/ApplicationReviewModal.tsx`
   - On open, fires `getCompanyApplicationDetail` into a `detail` state variable (separate from `localApplication` which comes from the list).
   - Header shows `candidate_name` as the primary identifier when available, with email shown below it; falls back to email-only when name is null.
   - Candidate Info section shows email (always), plus phone/LinkedIn/portfolio from `detail` (each null-guarded). Shows a "not added" message when all three are null.
   - `ScreeningAnswersPanel` (internal function in the modal file) renders Q1/Q2-prefixed question + answer pairs with a "Not answered" fallback for missing answers.
   - Detail fetch is non-critical: if it fails, the modal still fully works with list-level data (status, email, resume, screening answers already present in `localApplication`).

### E5: Members and roles
1. `lib/api/company.ts` (`listMembers`, `inviteMember`, `updateMemberRole`, `revokeMember`, `transferOwnership`)
2. `lib/hooks/useCompany.ts`
3. `app/(company)/companies/[companyId]/members/page.tsx`
   - Role-based team management checks are implemented in page logic.

### E6: Settings + ownership transfer
1. `app/(company)/companies/[companyId]/settings/page.tsx`
   - Profile updates + owner-only transfer ownership section.

### E7: Question banks builder
1. `lib/api/questionBanks.ts`
2. `lib/hooks/useQuestionBanks.ts`
3. `app/(company)/companies/[companyId]/question-banks/page.tsx`
   - Create/edit/save-as-new bank workflow.

---

## 6) Shared Components Worth Knowing Early

Read these once after Flows A–E:

1. `components/applications/ApplicationStatusBadge.tsx`
2. `components/jobs/JobStatusBadge.tsx`
3. `components/jobs/CompanyAvatar.tsx`
4. `components/shared/Pagination.tsx`
5. `components/shared/ConfirmModal.tsx`
6. `components/shared/EmptyState.tsx`

These are reused across many pages and explain a lot of repeated UI patterns quickly.

---

## 7) “If You’re Confused, Trace This Way” Rule

For any page:
1. Open the route file in `app/.../page.tsx`.
2. Check whether it uses hooks (`lib/hooks/...`) **or direct API calls** (`lib/api/...`).
3. Open the relevant hook(s) and follow called API methods.
4. Verify payload/response types in `types/index.ts`.
5. Return to the page and re-read with that context.

This is the fastest way to become productive.

---

## 8) 1-Week Learning Plan (Low Overwhelm)

### Day 1
- Section 0 + Flow A (Auth)

### Day 2
- Flow B (Public pages) + start Flow C (Apply wizard)

### Day 3
- Finish Flow C + Flow D (Candidate area)

### Day 4
- Flow E0–E3 (Company shell + dashboard + jobs)

### Day 5
- Flow E4–E7 (Applications, members, settings, question banks)

### Day 6
- Pick one bug/feature and trace it using Section 7.

### Day 7
- Explain one complete flow back to a teammate (best confidence test).

---

## 9) What to Read Last (Advanced)

- `components/ui/*` primitives
- `app/globals.css` design tokens and utility classes
- `FRONTEND_ARCHITECTURE_GUIDE.md`
- Cross-cutting polish files like `components/layout/*`

Start with flows first. Don’t start from primitives.
