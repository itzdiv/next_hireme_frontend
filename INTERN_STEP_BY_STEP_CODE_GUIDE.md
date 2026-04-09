# Intern Step-by-Step Code Guide (Next.js Beginner Friendly)

This guide is a **reading order** for understanding the project without getting overwhelmed.

Use this method:
1. Read one flow at a time.
2. Open the files in the exact order listed.
3. For each file, first understand **inputs**, then **main logic**, then **outputs/UI**.

---

## 0) First 20 Minutes: Understand Project Shape

Read these files in order:

1. `types/index.ts`
   - Learn the core domain models: `JobListing`, `JobApplication`, `Resume`, `Company`, `CompanyMember`.
   - This helps you decode API responses everywhere else.

2. `lib/api/client.ts`
   - Understand Axios base URL + auth token injection + 401 redirect behavior.

3. `lib/store.ts`
   - Learn how auth state is kept in Zustand (`token`, `isAuthenticated`, `hydrate`, `login`, `logout`).

4. `app/layout.tsx`
   - See global app shell and where shared providers/components are mounted.

After this, you know: **data shape + HTTP layer + auth state + app root**.

---

## 1) Flow A — Auth (Register/Login) End-to-End

### Goal
Understand how a user signs up and logs in.

### Read in this order

1. `lib/api/auth.ts`
   - API calls for register/login.

2. `lib/hooks/useAuth.ts`
   - `useRegister` and `useLogin` wrap API + loading/error state.
   - `useLogin` writes token via store.

3. `components/auth/RegisterForm.tsx`
   - Form validation + hook usage.

4. `components/auth/LoginForm.tsx`
   - Login submit flow + redirect.

5. `app/(auth)/register/page.tsx`
6. `app/(auth)/login/page.tsx`
7. `app/(auth)/layout.tsx`
   - How auth pages are routed and themed.

8. `components/shared/AuthHydration.tsx`
   - How auth state is restored on page load.

9. `proxy.ts`
   - Route protection behavior.

### Mental model
UI form → hook (`useAuth`) → API (`authApi`) → token store (`useAuthStore`) → protected pages unlocked.

---

## 2) Flow B — Public Job Discovery (Browse → Detail)

### Goal
Understand job listing and detail pages for non-company users.

### Read in this order

1. `lib/api/jobs.ts`
   - `browsePublic` endpoint.

2. `lib/hooks/useJobs.ts`
   - `usePublicJobs`.

3. `components/jobs/JobCard.tsx`
   - How each job is rendered in list view.

4. `app/jobs/page.tsx`
   - Search/filter + pagination + card list.

5. `app/jobs/[jobId]/page.tsx`
   - Detail page + apply CTA logic.

### Mental model
Public jobs API → hook state → job cards/list → job detail CTA.

---

## 3) Flow C — Apply to Job (4-Step Wizard)

### Goal
Understand the complete candidate application journey.

### Read in this order

1. `app/jobs/[jobId]/apply/page.tsx`
   - Main wizard logic (step state, validation, submit).

2. `lib/api/applications.ts`
   - `apply` endpoint.

3. `lib/hooks/useApplications.ts`
   - `useApplyToJob` mutation wrapper.

4. `types/index.ts` (revisit)
   - `ApplyToJobDto`, `ApplicationMode`, `Question`.

### What to focus on
- Step transitions and guards.
- Dynamic question rendering by type.
- Final payload creation and submit.

---

## 4) Flow D — Candidate Dashboard (Profile, Resumes, Applications)

### Goal
Understand candidate-side CRUD and downloads.

### D1: Profile
1. `lib/api/candidate.ts` (`getProfile`, `createProfile`, `updateProfile`)
2. `lib/hooks/useCandidate.ts` (`useProfile`, `useCreateProfile`, `useUpdateProfile`)
3. `app/(candidate)/profile/page.tsx`

### D2: Resumes (including new multipart upload + signed download)
1. `lib/api/candidate.ts` (`uploadResume`, `listResumes`, `downloadResume`, `setResumePrimary`, `deleteResume`)
2. `lib/hooks/useCandidate.ts` (`useResumes`, `useUploadResume`, `useDownloadResume`, etc.)
3. `app/(candidate)/resumes/page.tsx`

### D3: Applications list
1. `lib/api/applications.ts` (`listCandidateApplications`, `withdraw`)
2. `lib/hooks/useApplications.ts` (`useCandidateApplications`, `useWithdrawApplication`)
3. `app/(candidate)/applications/page.tsx`

### Shared layout
- `app/(candidate)/layout.tsx`
- `components/shared/CandidateBottomNav.tsx`

---

## 5) Flow E — Company Dashboard (Recruiter Side)

### Goal
Understand how company users manage jobs, applications, members, and settings.

### E1: Company shell
1. `app/(company)/[companyId]/layout.tsx`
2. `components/shared/Sidebar.tsx`
3. `components/shared/Navbar.tsx`

### E2: Company overview
1. `app/(company)/[companyId]/page.tsx`

### E3: Jobs management
1. `lib/api/jobs.ts`
2. `lib/hooks/useJobs.ts`
3. `app/(company)/[companyId]/jobs/page.tsx`
4. `app/(company)/[companyId]/jobs/new/page.tsx`
5. `app/(company)/[companyId]/jobs/[jobId]/page.tsx`

### E4: Applications review (including new resume endpoint)
1. `lib/api/applications.ts` (`listCompanyApplications`, `updateStatus`, `addComment`, `listComments`, `getApplicationResume`)
2. `lib/hooks/useApplications.ts` (`useCompanyApplications`, `useApplicationResumeDownload`)
3. `app/(company)/[companyId]/applications/page.tsx`

### E5: Members (updated routes)
1. `lib/api/company.ts` (invite/revoke/transfer ownership)
2. `lib/hooks/useCompany.ts`
3. `app/(company)/[companyId]/members/page.tsx`

### E6: Settings + ownership transfer
1. `app/(company)/[companyId]/settings/page.tsx`

### E7: Question banks
1. `lib/api/questionBanks.ts`
2. `lib/hooks/useQuestionBanks.ts`
3. `app/(company)/[companyId]/question-banks/page.tsx`

---

## 6) “If You’re Confused, Trace This Way” Rule

For any page:
1. Open the route file in `app/.../page.tsx`.
2. Identify hooks used by that page.
3. Open those hooks in `lib/hooks/...`.
4. Jump to called API methods in `lib/api/...`.
5. Verify DTO/types in `types/index.ts`.
6. Return to page and re-read with context.

This is the fastest way to become productive.

---

## 7) 1-Week Learning Plan (Low Overwhelm)

### Day 1
- Section 0 + Flow A (Auth)

### Day 2
- Flow B + Flow C (Jobs + Apply)

### Day 3
- Flow D (Candidate pages)

### Day 4
- Flow E1–E3 (Company shell + jobs)

### Day 5
- Flow E4–E7 (Applications, members, settings, question banks)

### Day 6
- Pick one bug/feature and trace it using Section 6.

### Day 7
- Explain one complete flow back to a teammate (best confidence test).

---

## 8) What to Read Last (Advanced)

- UI primitives in `components/ui/*`
- Design consistency docs
- Refactors and abstractions

Start with flows first. Don’t start from primitives.
