'use client';

import { use, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { jobsApi } from '@/lib/api/jobs';
import { useResumes } from '@/lib/hooks/useCandidate';
import { useApplyToJob } from '@/lib/hooks/useApplications';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { ApplicationMode, JobListing, Resume } from '@/types';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Circle,
  FileText,
  HelpCircle,
  Loader2,
  Video,
} from 'lucide-react';

type Step = 1 | 2 | 3 | 4;

const stepLabels: Array<{ id: Step; label: string }> = [
  { id: 1, label: 'Resume' },
  { id: 2, label: 'Questions' },
  { id: 3, label: 'Review' },
  { id: 4, label: 'Success' },
];

async function getPublicJobById(jobId: string): Promise<JobListing | null> {
  try {
    const result = await jobsApi.browsePublic({ page: 1, limit: 50 });
    return result.data.find((item) => item.id === jobId) ?? null;
  } catch {
    return null;
  }
}

export default function ApplyToJobPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = use(params);
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuthStore();

  const [loadingJob, setLoadingJob] = useState(true);
  const [job, setJob] = useState<JobListing | null>(null);
  const [step, setStep] = useState<Step>(1);
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [answers, setAnswers] = useState<Record<string, string | number | boolean>>({});
  const [videoUrl, setVideoUrl] = useState('');

  const { data: resumesResponse, loading: loadingResumes } = useResumes({ page: 1, limit: 20 });
  const { mutate: applyToJob, loading: submitting } = useApplyToJob();

  const resumes = useMemo(() => resumesResponse?.data ?? [], [resumesResponse]);
  const questions = useMemo(() => job?.screening_questions_json ?? [], [job]);
  const defaultResumeId = useMemo(() => {
    if (resumes.length === 0) return '';
    return resumes.find((resume) => resume.is_primary)?.id ?? resumes[0].id;
  }, [resumes]);
  const activeResumeId = selectedResumeId || defaultResumeId;
  const selectedResume = resumes.find((resume) => resume.id === activeResumeId) ?? null;

  const questionRequirements = useMemo(
    () => questions.filter((question) => question.is_required ?? true),
    [questions]
  );

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(`/jobs/${jobId}/apply`)}`);
    }
  }, [isHydrated, isAuthenticated, jobId, router]);

  useEffect(() => {
    let mounted = true;

    async function fetchJob() {
      setLoadingJob(true);
      const result = await getPublicJobById(jobId);
      if (mounted) {
        setJob(result);
        setLoadingJob(false);
      }
    }

    fetchJob();

    return () => {
      mounted = false;
    };
  }, [jobId]);

  const canProceedStep1 = Boolean(activeResumeId);
  const canProceedStep2 = questionRequirements.every((question) => {
    const value = answers[question.id];
    return value !== undefined && value !== null && value !== '';
  });

  const canSubmit = canProceedStep1 && canProceedStep2 && !submitting;

  const goToStep = (targetStep: Step) => {
    if (targetStep < step) {
      setStep(targetStep);
      return;
    }

    if (targetStep === 2 && !canProceedStep1) return;
    if (targetStep === 3 && (!canProceedStep1 || !canProceedStep2)) return;

    setStep(targetStep);
  };

  const handleAnswerChange = (
    questionId: string,
    value: string | number | boolean
  ) => {
    setAnswers((current) => ({
      ...current,
      [questionId]: value,
    }));
  };

  const renderQuestionInput = (question: NonNullable<JobListing['screening_questions_json']>[number]) => {
    const value = answers[question.id];

    if (question.type === 'number') {
      return (
        <Input
          type="number"
          value={typeof value === 'number' || typeof value === 'string' ? value : ''}
          onChange={(event) => handleAnswerChange(question.id, Number(event.target.value))}
          className="h-12 bg-muted/40"
          placeholder="Enter a number"
        />
      );
    }

    if (question.type === 'boolean') {
      return (
        <Select
          value={typeof value === 'boolean' ? String(value) : ''}
          onValueChange={(selected) => {
            if (!selected) return;
            handleAnswerChange(question.id, selected === 'true');
          }}
        >
          <SelectTrigger className="h-12 bg-muted/40">
            <SelectValue placeholder="Select Yes or No" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Yes</SelectItem>
            <SelectItem value="false">No</SelectItem>
          </SelectContent>
        </Select>
      );
    }

    if (question.type === 'choice') {
      return (
        <Select
          value={typeof value === 'string' ? value : ''}
          onValueChange={(selected) => {
            if (!selected) return;
            handleAnswerChange(question.id, selected);
          }}
        >
          <SelectTrigger className="h-12 bg-muted/40">
            <SelectValue placeholder="Choose an option" />
          </SelectTrigger>
          <SelectContent>
            {(question.options ?? []).map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    return (
      <Textarea
        value={typeof value === 'string' ? value : ''}
        onChange={(event) => handleAnswerChange(question.id, event.target.value)}
        rows={4}
        className="bg-muted/40"
        placeholder="Write your answer"
      />
    );
  };

  const handleSubmit = async () => {
    if (!job || !activeResumeId || !canSubmit) return;

    try {
      await applyToJob({
        job_id: job.id,
        resume_id: activeResumeId,
        answers_json: Object.keys(answers).length > 0 ? answers : undefined,
        video_url: videoUrl.trim() || undefined,
      });

      toast.success('Application submitted successfully');
      setStep(4);
    } catch {
      toast.error('Failed to submit application');
    }
  };

  if (loadingJob) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <Skeleton className="mb-4 h-8 w-64" />
          <Skeleton className="mb-8 h-6 w-80" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h1 className="text-2xl font-bold">Job not found</h1>
          <p className="mt-2 text-muted-foreground">This listing may be removed or unavailable.</p>
          <Button className="mt-6" onClick={() => router.push('/jobs')}>
            Back to Jobs
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 page-enter">
        <Button variant="ghost" size="sm" onClick={() => router.push(`/jobs/${job.id}`)} className="-ml-2 mb-4 text-muted-foreground">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Job
        </Button>

        <h1 className="text-3xl font-bold tracking-tight">Apply to {job.title}</h1>
        <p className="mt-2 text-muted-foreground">Complete all steps to submit your application.</p>

        <div className="mt-6 grid grid-cols-4 gap-2 rounded-xl border border-border/40 bg-muted/20 p-2">
          {stepLabels.map((stepItem) => {
            const isDone = step > stepItem.id;
            const isCurrent = step === stepItem.id;

            return (
              <button
                key={stepItem.id}
                type="button"
                onClick={() => goToStep(stepItem.id)}
                className={`flex items-center justify-center gap-2 rounded-lg px-2 py-2 text-xs font-medium transition-colors sm:text-sm ${
                  isCurrent
                    ? 'bg-background text-foreground shadow-sm'
                    : isDone
                      ? 'text-violet-600'
                      : 'text-muted-foreground'
                }`}
              >
                {isDone ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-3.5 w-3.5" />}
                {stepItem.label}
              </button>
            );
          })}
        </div>

        <Card className="mt-6 border-border/40">
          {step === 1 ? (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-violet-600" />
                  Step 1: Resume Selection
                </CardTitle>
                <CardDescription>Select the resume you want to submit for this role.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loadingResumes ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <Skeleton key={index} className="h-24 rounded-xl" />
                    ))}
                  </div>
                ) : resumes.length > 0 ? (
                  <div className="space-y-3">
                    {resumes.map((resume: Resume) => {
                      const isSelected = activeResumeId === resume.id;
                      return (
                        <button
                          key={resume.id}
                          type="button"
                          onClick={() => setSelectedResumeId(resume.id)}
                          className={`w-full rounded-xl border p-4 text-left transition-all ${
                            isSelected
                              ? 'border-violet-500 ring-2 ring-violet-500/20 bg-violet-500/[0.06]'
                              : 'border-border/50 hover:border-violet-500/30'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="font-semibold">{resume.title || 'Untitled Resume'}</p>
                              <p className="text-sm text-muted-foreground">
                                Uploaded {new Date(resume.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {resume.is_primary ? <Badge className="badge-owner">Primary</Badge> : null}
                              {isSelected ? (
                                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-600 text-white">
                                  <Check className="h-4 w-4" />
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-border/60 p-5 text-sm text-muted-foreground">
                    You need at least one resume before applying.
                    <Link href="/resumes" className="ml-1 text-violet-600 hover:text-violet-500">Go to Resumes</Link>
                  </div>
                )}
              </CardContent>
            </>
          ) : null}

          {step === 2 ? (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-amber-600" />
                  Step 2: Screening Questions
                </CardTitle>
                <CardDescription>
                  {job.application_mode === ApplicationMode.STANDARD
                    ? 'No additional screening is required for this role.'
                    : 'Answer the screening prompts to continue.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {questions.length > 0 ? (
                  questions.map((question, index) => (
                    <div key={question.id} className="space-y-2 rounded-xl border border-border/50 bg-muted/20 p-4">
                      <Label className="text-sm font-semibold">
                        {index + 1}. {question.question}
                        {(question.is_required ?? true) ? ' *' : ''}
                      </Label>
                      {renderQuestionInput(question)}
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-border/60 p-5 text-sm text-muted-foreground">
                    This job does not include screening questions.
                  </div>
                )}

                {job.application_mode === ApplicationMode.VIDEO ? (
                  <div className="space-y-2 rounded-xl border border-border/50 bg-muted/20 p-4">
                    <Label htmlFor="video-url" className="text-sm font-semibold flex items-center gap-2">
                      <Video className="h-4 w-4 text-violet-600" />
                      Video Response URL (optional)
                    </Label>
                    <Input
                      id="video-url"
                      type="url"
                      placeholder="https://..."
                      value={videoUrl}
                      onChange={(event) => setVideoUrl(event.target.value)}
                      className="h-12 bg-background"
                    />
                  </div>
                ) : null}
              </CardContent>
            </>
          ) : null}

          {step === 3 ? (
            <>
              <CardHeader>
                <CardTitle>Step 3: Review</CardTitle>
                <CardDescription>Confirm your details before submitting.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Selected Resume</p>
                  <p className="mt-1 font-semibold">{selectedResume?.title || 'Untitled Resume'}</p>
                </div>

                {questions.length > 0 ? (
                  <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Screening Answers</p>
                    <div className="mt-3 space-y-3">
                      {questions.map((question) => (
                        <div key={question.id}>
                          <p className="text-sm font-medium">{question.question}</p>
                          <p className="text-sm text-muted-foreground">
                            {String(answers[question.id] ?? 'Not answered')}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {videoUrl ? (
                  <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Video URL</p>
                    <p className="mt-1 text-sm break-all">{videoUrl}</p>
                  </div>
                ) : null}
              </CardContent>
            </>
          ) : null}

          {step === 4 ? (
            <CardContent className="py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h2 className="mt-6 text-2xl font-bold">Application Submitted</h2>
              <p className="mt-2 text-muted-foreground">
                Your application has been sent successfully. You can track updates from your applications dashboard.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button onClick={() => router.push('/applications')} className="btn-gradient">
                  Go to My Applications
                </Button>
                <Button variant="outline" onClick={() => router.push('/jobs')}>
                  Browse More Jobs
                </Button>
              </div>
            </CardContent>
          ) : null}
        </Card>

        {step < 4 ? (
          <div className="mt-6 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setStep((current) => (Math.max(1, current - 1) as Step))}
              disabled={step === 1 || submitting}
            >
              Back
            </Button>

            {step < 3 ? (
              <Button
                className="btn-gradient"
                onClick={() => setStep((current) => (Math.min(3, current + 1) as Step))}
                disabled={(step === 1 && !canProceedStep1) || (step === 2 && !canProceedStep2)}
              >
                Next
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button className="btn-gradient" onClick={handleSubmit} disabled={!canSubmit}>
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Submit Application
              </Button>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}