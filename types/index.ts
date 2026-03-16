// ─── Enums ───────────────────────────────────────────────

export enum MemberRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  RECRUITER = 'RECRUITER',
}

export enum MemberStatus {
  ACTIVE = 'ACTIVE',
  INVITED = 'INVITED',
  REVOKED = 'REVOKED',
}

export enum JobStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
}

export enum JobVisibility {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
}

export enum ApplicationMode {
  STANDARD = 'STANDARD',
  QUESTIONNAIRE = 'QUESTIONNAIRE',
  VIDEO = 'VIDEO',
}

export enum ApplicationStatus {
  APPLIED = 'APPLIED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
}

// ─── Entity Interfaces ───────────────────────────────────

/** Shape returned by GET /api/v1/companies/me */
export interface MyCompanyMembership {
  membership_id: string;
  company_id: string;
  company_name: string;
  company_logo_url: string | null;
  role: MemberRole;
  status: MemberStatus;
}

export interface User {
  id: string;
  email: string;
  is_active: boolean;
  is_email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface CandidateProfile {
  id: string;
  user_id: string;
  full_name: string;
  bio: string | null;
  photo_url: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface Resume {
  id: string;
  user_id: string;
  title: string | null;
  file_url: string;
  file_name?: string;
  file_size_bytes?: number;
  is_used_in_applications?: boolean;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  website: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CompanyMember {
  id: string;
  company_id: string;
  user_id: string;
  email: string;
  role: MemberRole;
  status: MemberStatus;
  invited_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Question {
  id: string;
  question: string;
  category?: string;
  type: 'text' | 'number' | 'boolean' | 'choice';
  options?: string[];
  is_required?: boolean;
}

export interface QuestionBank {
  id: string;
  company_id: string;
  created_by: string | null;
  name: string;
  questions_json: Question[];
  created_at: string;
  updated_at: string;
}

export interface JobListing {
  id: string;
  company_id: string;
  company_name?: string;
  company_logo_url?: string | null;
  created_by: string | null;
  title: string;
  description: string;
  requirements: string | null;
  salary_range: string | null;
  location: string | null;
  employment_type: string | null;
  application_mode: ApplicationMode;
  visibility: JobVisibility;
  status: JobStatus;
  application_deadline: string | null;
  screening_questions_json: Question[] | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Comment shape returned inside CandidateApplication.comments.
 * Only includes comments where visible_to_candidate = true.
 */
export interface CandidateVisibleComment {
  id: string;
  comment: string;
  created_at: string;
}

/**
 * Shape returned by GET /api/v1/candidate/applications
 * Represents a single application from the candidate's perspective.
 */
export interface CandidateApplication {
  id: string;
  job_id: string;
  company_id: string;
  user_id: string;
  resume_id: string | null;
  answers_json: Record<string, unknown> | null;
  video_url: string | null;
  status: ApplicationStatus;
  status_changed_by: string | null;
  applied_at: string;
  last_updated_at: string;
  job: {
    id: string;
    title: string;
    company_name: string;
    application_mode: ApplicationMode;
    screening_questions_json: Question[] | null;
  };
  comments: CandidateVisibleComment[];
  created_at: string;
  updated_at: string;
}

/**
 * Shape returned by GET /api/v1/companies/:companyId/applications
 * Represents a single application from the company/recruiter perspective.
 */
export interface CompanyApplication {
  id: string;
  job_id: string;
  company_id: string;
  user_id: string;
  resume_id: string | null;
  answers_json: Record<string, unknown> | null;
  video_url: string | null;
  status: ApplicationStatus;
  status_changed_by: string | null;
  candidate_email: string;
  job_title: string;
  resume_url: string;
  comments_count: number;
  created_at: string;
  updated_at: string;
}

/**
 * Full detail shape used when viewing a single application on the company side.
 * Includes screening questions for rendering the Q&A panel.
 */
export interface CompanyApplicationDetail extends CompanyApplication {
  application_mode: ApplicationMode;
  screening_questions_json: Question[] | null;
}

export interface ApplicationComment {
  id: string;
  job_application_id: string;
  company_id: string;
  user_id: string | null;
  user_email?: string;
  comment: string;
  visible_to_candidate: boolean;
  created_at: string;
  updated_at: string;
}

// ─── Pagination ──────────────────────────────────────────

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

// ─── Request DTOs ────────────────────────────────────────

export interface RegisterDto {
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResponse {
  acess_token: string; // Note: typo from backend
}

export interface CreateCompanyDto {
  name: string;
  description?: string;
  logo_url?: string;
  website?: string;
}

export interface UpdateCompanyDto {
  name?: string;
  description?: string;
  logo_url?: string;
  website?: string;
}

export interface InviteMemberDto {
  email: string;
  role: MemberRole;
}

export interface UpdateRoleDto {
  role: MemberRole;
}

export interface CreateQuestionBankDto {
  name: string;
  questions_json: Question[];
}

export interface UpdateQuestionBankDto {
  name?: string;
  questions_json?: Question[];
}

export interface CreateJobDto {
  title: string;
  description: string;
  requirements?: string;
  salary_range?: string;
  location?: string;
  employment_type?: string;
  application_mode?: ApplicationMode;
  visibility?: JobVisibility;
  status?: JobStatus;
  application_deadline?: string;
  question_bank_id?: string;
}

export interface UpdateJobDto {
  title?: string;
  description?: string;
  requirements?: string;
  salary_range?: string;
  location?: string;
  employment_type?: string;
  application_mode?: ApplicationMode;
  visibility?: JobVisibility;
  status?: JobStatus;
  application_deadline?: string;
  question_bank_id?: string;
}

export interface UpdateJobStatusDto {
  status: JobStatus;
}

export interface ApplyToJobDto {
  job_id: string;
  resume_id: string;
  answers_json?: Record<string, unknown>;
  video_url?: string;
}

export interface UpdateApplicationStatusDto {
  status: ApplicationStatus.ACCEPTED | ApplicationStatus.REJECTED;
}

export interface CreateCommentDto {
  comment: string;
  visible_to_candidate?: boolean;
}

export interface CreateProfileDto {
  full_name: string;
  bio?: string;
  photo_url?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  phone?: string;
}

export interface UpdateProfileDto {
  full_name?: string;
  bio?: string;
  photo_url?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  phone?: string;
}

export interface CreateResumeDto {
  file: File;
  title?: string;
  is_primary?: boolean;
}

export interface SignedDownloadResponse {
  download_url: string;
  filename: string;
  mime_type: string;
  expires_in: number;
}

export interface ApplicationResumeResponse extends SignedDownloadResponse {
  file_size_bytes: number;
}

// ─── API Error ───────────────────────────────────────────

export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
}
