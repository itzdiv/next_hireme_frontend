'use client';

import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ScreeningQuestionsForm } from './ScreeningQuestionsForm';
import {
  FileText, CheckCircle2, AlertCircle, Video, HelpCircle, Star,
} from 'lucide-react';
import type { JobListing, Resume, Question } from '@/types';
import type { FlowErrors } from './useApplyToJobFlow';

type Step = 1 | 2 | 3 | 4;

interface ApplyStepContentProps {
  step: Step;
  errors: FlowErrors;
  loadingResumes: boolean;
  resumes: Resume[];
  activeResumeId: string;
  job: JobListing | null;
  questions: Question[] | null;
  answers: Record<string, unknown>;
  videoUrl: string;
  selectedResume: Resume | null;
  isQuestionnaireMode: boolean;
  isVideoMode: boolean;
  isStandardMode: boolean;
  resumeReturnToHref: string;
  onSelectResume: (id: string) => void;
  onClearResumeError: () => void;
  onAnswerChange: (questionId: string, value: unknown) => void;
  onVideoUrlChange: React.Dispatch<React.SetStateAction<string>>;
  onClearVideoError: () => void;
  onGoToApplications: () => void;
  onGoToJobs: () => void;
}

// â”€â”€â”€ Step 1: Resume Selection â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function ResumeSelectionStep({
  loadingResumes,
  resumes,
  activeResumeId,
  errors,
  resumeReturnToHref,
  onSelectResume,
  onClearResumeError,
}: Pick<ApplyStepContentProps, 'loadingResumes' | 'resumes' | 'activeResumeId' | 'errors' | 'resumeReturnToHref' | 'onSelectResume' | 'onClearResumeError'>) {
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="mb-1 text-lg font-semibold">Select a resume</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Choose which resume to attach to this application.
        </p>

        {errors.resume_id && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-[#FECACA] bg-[#FFE2E2] px-4 py-3 text-sm text-[#991B1B]">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {errors.resume_id}
          </div>
        )}

        {loadingResumes ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        ) : resumes.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-8 text-center">
            <FileText className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm font-medium">You need a resume before applying</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Upload one first, then come right back to this application.
            </p>
            <Link
              href={resumeReturnToHref}
              className="btn-gradient mt-4 inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              Upload a Resume
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {resumes.map((resume) => {
              const isSelected = resume.id === activeResumeId;
              return (
                <button
                  key={resume.id}
                  type="button"
                  onClick={() => {
                    onSelectResume(resume.id);
                    onClearResumeError();
                  }}
                  className={cn(
                    'w-full rounded-lg border px-4 py-3 text-left transition-all',
                    isSelected
                      ? 'border-[#BFDBFE] bg-[#EFF6FF] ring-1 ring-[#BFDBFE]'
                      : 'border-border hover:border-[#BFDBFE] hover:bg-muted/40',
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <FileText className={cn('h-5 w-5 shrink-0', isSelected ? 'text-[#1E40AF]' : 'text-muted-foreground')} />
                      <div>
                        <p className="text-sm font-medium">
                          {resume.title ?? resume.file_name ?? 'Resume'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {resume.file_name ?? 'Untitled file'}
                          {resume.created_at ? ` Uploaded ${new Date(resume.created_at).toLocaleDateString()}` : ''}
                          {resume.file_size_bytes ? ` ${(resume.file_size_bytes / 1024).toFixed(0)} KB` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {resume.is_primary && (
                        <Badge variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-500/20 text-xs">
                          <Star className="mr-1 h-3 w-3" />
                          Primary
                        </Badge>
                      )}
                      {isSelected && (
                        <CheckCircle2 className="h-5 w-5 text-[#1E40AF]" />
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// â”€â”€â”€ Step 2: Details (Questionnaire / Video / Standard) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function DetailsStep({
  isQuestionnaireMode,
  isVideoMode,
  questions,
  answers,
  videoUrl,
  errors,
  onAnswerChange,
  onVideoUrlChange,
  onClearVideoError,
}: Pick<
  ApplyStepContentProps,
  | 'isQuestionnaireMode'
  | 'isVideoMode'
  | 'questions'
  | 'answers'
  | 'videoUrl'
  | 'errors'
  | 'onAnswerChange'
  | 'onVideoUrlChange'
  | 'onClearVideoError'
>) {
  if (isQuestionnaireMode) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-amber-600" />
            <h2 className="text-lg font-semibold">Screening questions</h2>
          </div>
          <p className="mb-5 text-sm text-muted-foreground">
            Answer the employer&apos;s questions below. Required questions are marked with an asterisk.
          </p>

          {errors.summary && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-[#FECACA] bg-[#FFE2E2] px-4 py-3 text-sm text-[#991B1B]">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {errors.summary}
            </div>
          )}

          <ScreeningQuestionsForm
            questions={questions}
            answers={answers}
            onChange={onAnswerChange}
          />
        </CardContent>
      </Card>
    );
  }

  if (isVideoMode) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <Video className="h-5 w-5 text-[#1E40AF]" />
            <h2 className="text-lg font-semibold">Video introduction</h2>
          </div>
          <p className="mb-5 text-sm text-muted-foreground">
            Provide a link to a short video introduction (YouTube, Loom, Vimeo, etc.).
          </p>

          {errors.video_url && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-[#FECACA] bg-[#FFE2E2] px-4 py-3 text-sm text-[#991B1B]">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {errors.video_url}
            </div>
          )}

          <div>
            <Label htmlFor="video-url" className="mb-1.5 block text-sm font-medium">
              Video URL <span className="text-destructive">*</span>
            </Label>
            <Input
              id="video-url"
              type="url"
              value={videoUrl}
              onChange={(e) => {
                onVideoUrlChange(e.target.value);
                if (e.target.value) onClearVideoError();
              }}
              placeholder="https://youtube.com/watch?v=â€¦"
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}

// â”€â”€â”€ Step 3: Review â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function ReviewStep({
  selectedResume,
  job,
  isQuestionnaireMode,
  isVideoMode,
  questions,
  answers,
  videoUrl,
  errors,
}: Pick<
  ApplyStepContentProps,
  | 'selectedResume'
  | 'job'
  | 'isQuestionnaireMode'
  | 'isVideoMode'
  | 'questions'
  | 'answers'
  | 'videoUrl'
  | 'errors'
>) {
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="mb-1 text-lg font-semibold">Review your application</h2>
        <p className="mb-5 text-sm text-muted-foreground">
          Check everything below before submitting.
        </p>

        {errors.summary && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-[#FECACA] bg-[#FFE2E2] px-4 py-3 text-sm text-[#991B1B]">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {errors.summary}
          </div>
        )}

        <div className="space-y-5">
          {/* Job summary */}
          {job && (
            <div className="rounded-lg border border-border/60 bg-muted/30 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Applying to</p>
              <p className="mt-0.5 font-semibold">{job.title}</p>
              {job.company_name && (
                <p className="text-sm text-muted-foreground">{job.company_name}</p>
              )}
            </div>
          )}

          {/* Resume */}
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Resume</p>
            {selectedResume ? (
              <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 px-4 py-3">
                <FileText className="h-5 w-5 shrink-0 text-[#1E40AF]" />
                <p className="text-sm font-medium">
                  {selectedResume.title ?? selectedResume.file_name ?? 'Resume'}
                </p>
                {selectedResume.is_primary && (
                  <Badge variant="outline" className="ml-auto bg-amber-500/10 text-amber-700 border-amber-500/20 text-xs">
                    Primary
                  </Badge>
                )}
              </div>
            ) : (
              <p className="text-sm text-destructive">No resume selected.</p>
            )}
          </div>

          {/* Video URL */}
          {isVideoMode && videoUrl && (
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Video introduction</p>
              <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 px-4 py-3">
                <Video className="h-5 w-5 shrink-0 text-[#1E40AF]" />
                <p className="truncate text-sm">{videoUrl}</p>
              </div>
            </div>
          )}

          {/* Questionnaire answers */}
          {isQuestionnaireMode && Array.isArray(questions) && questions.length > 0 && (
            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Screening answers</p>
              <div className="space-y-3">
                {questions.map((q) => {
                  const rawAnswer = answers[q.id];
                  let displayAnswer = 'â€”';
                  if (rawAnswer !== undefined && rawAnswer !== null && rawAnswer !== '') {
                    if (typeof rawAnswer === 'boolean') {
                      displayAnswer = rawAnswer ? 'Yes' : 'No';
                    } else {
                      displayAnswer = String(rawAnswer);
                    }
                  }
                  return (
                    <div key={q.id} className="rounded-lg border border-border/60 bg-muted/30 px-4 py-3">
                      <p className="text-xs font-medium text-muted-foreground">{q.question}</p>
                      <p className="mt-0.5 text-sm">{displayAnswer}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// â”€â”€â”€ Step 4: Success â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function SuccessStep({
  onGoToApplications,
  onGoToJobs,
}: Pick<ApplyStepContentProps, 'onGoToApplications' | 'onGoToJobs'>) {
  return (
    <Card>
      <CardContent className="p-10 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#DBFCE7] border border-[#BBF7D0]">
          <CheckCircle2 className="h-8 w-8 text-[#166534]" />
        </div>
        <h2 className="text-2xl font-bold">Application Submitted!</h2>
        <p className="mt-2 text-muted-foreground">
          Your application has been sent. We will notify you of any updates.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button className="btn-gradient w-full sm:w-auto" onClick={onGoToApplications}>
            View My Applications
          </Button>
          <Button variant="outline" className="w-full sm:w-auto" onClick={onGoToJobs}>
            Browse More Jobs
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// â”€â”€â”€ Main exported component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function ApplyStepContent(props: ApplyStepContentProps) {
  const { step, isStandardMode } = props;
  const isReviewStep = isStandardMode ? step === 2 : step === 3;

  if (step === 1) {
    return (
      <ResumeSelectionStep
        loadingResumes={props.loadingResumes}
        resumes={props.resumes}
        activeResumeId={props.activeResumeId}
        errors={props.errors}
        resumeReturnToHref={props.resumeReturnToHref}
        onSelectResume={props.onSelectResume}
        onClearResumeError={props.onClearResumeError}
      />
    );
  }

  if (!isStandardMode && step === 2) {
    return (
      <DetailsStep
        isQuestionnaireMode={props.isQuestionnaireMode}
        isVideoMode={props.isVideoMode}
        questions={props.questions}
        answers={props.answers}
        videoUrl={props.videoUrl}
        errors={props.errors}
        onAnswerChange={props.onAnswerChange}
        onVideoUrlChange={props.onVideoUrlChange}
        onClearVideoError={props.onClearVideoError}
      />
    );
  }

  if (isReviewStep) {
    return (
      <ReviewStep
        selectedResume={props.selectedResume}
        job={props.job}
        isQuestionnaireMode={props.isQuestionnaireMode}
        isVideoMode={props.isVideoMode}
        questions={props.questions}
        answers={props.answers}
        videoUrl={props.videoUrl}
        errors={props.errors}
      />
    );
  }

  return (
    <SuccessStep
      onGoToApplications={props.onGoToApplications}
      onGoToJobs={props.onGoToJobs}
    />
  );
}


