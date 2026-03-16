'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { applicationsApi } from '@/lib/api/applications';
import { jobsApi } from '@/lib/api/jobs';
import { useResumes } from '@/lib/hooks/useCandidate';
import { useApplyToJob } from '@/lib/hooks/useApplications';
import { useAuthStore } from '@/lib/store';
import { toast } from 'sonner';
import type { CandidateApplication, JobListing, Resume, Question } from '@/types';
import { ApplicationMode, JobStatus } from '@/types';

type Step = 1 | 2 | 3 | 4;

export interface ApplyFlowStep {
  number: 1 | 2 | 3;
  label: 'Resume' | 'Questions' | 'Video' | 'Review';
}

export interface FlowErrors {
  resume_id?: string;
  summary?: string;
  video_url?: string;
}

export interface ApplyFlowResult {
  router: AppRouterInstance;
  loadingJob: boolean;
  checkingExistingApplication: boolean;
  job: JobListing | null;
  step: Step;
  steps: ApplyFlowStep[];
  reviewStep: 2 | 3;
  errors: FlowErrors;
  loadingResumes: boolean;
  resumes: Resume[];
  activeResumeId: string;
  questions: Question[] | null;
  answers: Record<string, unknown>;
  videoUrl: string;
  selectedResume: Resume | null;
  isQuestionnaireMode: boolean;
  isVideoMode: boolean;
  isStandardMode: boolean;
  setSelectedResumeId: (id: string) => void;
  setErrors: React.Dispatch<React.SetStateAction<FlowErrors>>;
  handleAnswerChange: (questionId: string, value: unknown) => void;
  setVideoUrl: React.Dispatch<React.SetStateAction<string>>;
  goToStep: (step: Step) => void;
  setStep: React.Dispatch<React.SetStateAction<Step>>;
  validateStep: (step: 1 | 2) => boolean;
  submitting: boolean;
  handleSubmit: () => Promise<void>;
}

function buildSteps(mode: ApplicationMode | undefined): ApplyFlowStep[] {
  if (mode === ApplicationMode.QUESTIONNAIRE) {
    return [
      { number: 1, label: 'Resume' },
      { number: 2, label: 'Questions' },
      { number: 3, label: 'Review' },
    ];
  }

  if (mode === ApplicationMode.VIDEO) {
    return [
      { number: 1, label: 'Resume' },
      { number: 2, label: 'Video' },
      { number: 3, label: 'Review' },
    ];
  }

  return [
    { number: 1, label: 'Resume' },
    { number: 2, label: 'Review' },
  ];
}

export function useApplyToJobFlow(jobId: string): ApplyFlowResult {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const [job, setJob] = useState<JobListing | null>(null);
  const [loadingJob, setLoadingJob] = useState(true);
  const [checkingExistingApplication, setCheckingExistingApplication] = useState(false);
  const [step, setStep] = useState<Step>(1);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [videoUrl, setVideoUrl] = useState('');
  const [errors, setErrors] = useState<FlowErrors>({});

  const resumeParams = useMemo(() => ({ page: 1, limit: 100 }), []);
  const { data: resumeData, loading: loadingResumes } = useResumes(resumeParams);
  const { mutate: applyToJob, loading: submitting } = useApplyToJob();

  const resumes = useMemo(() => resumeData?.data ?? [], [resumeData]);
  const steps = useMemo(() => buildSteps(job?.application_mode), [job?.application_mode]);
  const reviewStep = steps[steps.length - 1].number as 2 | 3;

  useEffect(() => {
    let isMounted = true;
    async function fetchJob() {
      setLoadingJob(true);
      try {
        const result = await jobsApi.getPublicJobById(jobId);

        if (result.status === JobStatus.CLOSED) {
          router.replace(`/jobs/${jobId}?status=closed`);
        }

        if (isMounted) setJob(result);
      } catch {
        if (isMounted) setJob(null);
      } finally {
        if (isMounted) setLoadingJob(false);
      }
    }
    fetchJob();
    return () => { isMounted = false; };
  }, [jobId]);

  useEffect(() => {
    if (!isHydrated || !isAuthenticated) return;

    let isMounted = true;

    async function checkExistingApplication() {
      setCheckingExistingApplication(true);
      try {
        const result = await applicationsApi.listCandidateApplications({ page: 1, limit: 200 });
        const existing = result.data.find(
          (application: CandidateApplication) => application.job_id === jobId || application.job?.id === jobId,
        );

        if (existing && isMounted) {
          router.replace(`/jobs/${jobId}?already_applied=true`);
          return;
        }
      } catch {
        // Do not block the apply page if this non-critical check fails.
      } finally {
        if (isMounted) {
          setCheckingExistingApplication(false);
        }
      }
    }

    checkExistingApplication();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, isHydrated, jobId, router]);

  useEffect(() => {
    if (step !== 4 && step > reviewStep) {
      setStep(reviewStep);
    }
  }, [reviewStep, step]);

  // Pre-select primary resume once resumes are loaded
  useEffect(() => {
    if (resumes.length > 0 && !selectedResumeId) {
      const primary = resumes.find((r) => r.is_primary) ?? resumes[0];
      setSelectedResumeId(primary.id);
    }
  }, [resumes, selectedResumeId]);

  const isQuestionnaireMode = job?.application_mode === ApplicationMode.QUESTIONNAIRE;
  const isVideoMode = job?.application_mode === ApplicationMode.VIDEO;
  const isStandardMode = job?.application_mode === ApplicationMode.STANDARD;

  const questions: Question[] | null = useMemo(
    () => (isQuestionnaireMode ? (job?.screening_questions_json ?? null) : []),
    [isQuestionnaireMode, job],
  );

  const selectedResume = useMemo(
    () => resumes.find((r) => r.id === selectedResumeId) ?? null,
    [resumes, selectedResumeId],
  );

  const handleAnswerChange = useCallback((questionId: string, value: unknown) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setErrors((prev) => ({ ...prev, summary: undefined }));
  }, []);

  const goToStep = useCallback((s: Step) => {
    if (s <= reviewStep) {
      setStep(s);
    }
  }, [reviewStep]);

  const validateStep = useCallback((s: 1 | 2): boolean => {
    if (s === 1) {
      if (!selectedResumeId) {
        setErrors((prev) => ({ ...prev, resume_id: 'Please select a resume to continue.' }));
        return false;
      }
      setErrors((prev) => ({ ...prev, resume_id: undefined }));
      return true;
    }

    if (s === 2) {
      if (isVideoMode) {
        if (!videoUrl.trim()) {
          setErrors((prev) => ({ ...prev, video_url: 'Please provide a video URL to continue.' }));
          return false;
        }
        setErrors((prev) => ({ ...prev, video_url: undefined }));
      }
      if (isQuestionnaireMode) {
        if (!Array.isArray(questions)) {
          setErrors((prev) => ({ ...prev, summary: 'Unable to load screening questions. Please refresh and try again.' }));
          return false;
        }
        const unanswered = questions.filter(
          (q) => q.is_required !== false && (answers[q.id] === undefined || answers[q.id] === '' || answers[q.id] === null),
        );
        if (unanswered.length > 0) {
          setErrors((prev) => ({ ...prev, summary: `Please answer all required questions before continuing. ${unanswered.length} required question(s) remaining.` }));
          return false;
        }
        setErrors((prev) => ({ ...prev, summary: undefined }));
      }
      return true;
    }

    return true;
  }, [selectedResumeId, isVideoMode, isQuestionnaireMode, videoUrl, questions, answers]);

  const handleSubmit = useCallback(async () => {
    if (!selectedResumeId) {
      setErrors((prev) => ({ ...prev, resume_id: 'Please select a resume to continue.' }));
      setStep(1);
      return;
    }
    if (isQuestionnaireMode && !Array.isArray(questions)) {
      setErrors((prev) => ({ ...prev, summary: 'Unable to load screening questions. Please refresh and try again.' }));
      return;
    }
    try {
      await applyToJob({
        job_id: jobId,
        resume_id: selectedResumeId,
        answers_json: isQuestionnaireMode ? answers : undefined,
        video_url: isVideoMode ? (videoUrl.trim() || undefined) : undefined,
      });
      setStep(4);
    } catch {
      toast.error('Failed to submit application. Please try again.');
    }
  }, [selectedResumeId, jobId, applyToJob, isQuestionnaireMode, isVideoMode, answers, videoUrl, questions]);

  return {
    router,
    loadingJob,
    checkingExistingApplication,
    job,
    step,
    steps,
    reviewStep,
    errors,
    loadingResumes,
    resumes,
    activeResumeId: selectedResumeId,
    questions,
    answers,
    videoUrl,
    selectedResume,
    isQuestionnaireMode,
    isVideoMode,
    isStandardMode,
    setSelectedResumeId,
    setErrors,
    handleAnswerChange,
    setVideoUrl,
    goToStep,
    setStep,
    validateStep,
    submitting,
    handleSubmit,
  };
}
