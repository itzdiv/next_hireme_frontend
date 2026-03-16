'use client';

import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  Heart,
  HelpCircle,
  Info,
  MapPin,
  Video,
  XCircle,
} from 'lucide-react';
import { applicationsApi } from '@/lib/api/applications';
import { jobsApi } from '@/lib/api/jobs';
import { useAuthStore } from '@/lib/store';
import { CompanyAvatar } from '@/components/jobs/CompanyAvatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { CandidateApplication, JobListing } from '@/types';
import { ApplicationMode, JobStatus } from '@/types';

const modeLabels = {
  [ApplicationMode.STANDARD]: { label: 'Resume Only', icon: FileText, color: 'text-blue-600 bg-blue-50' },
  [ApplicationMode.QUESTIONNAIRE]: { label: 'Resume + Questions', icon: HelpCircle, color: 'text-amber-600 bg-amber-50' },
  [ApplicationMode.VIDEO]: { label: 'Resume + Video', icon: Video, color: 'text-[#1E40AF] bg-[#EFF6FF]' },
};

interface SavedJob {
  id: string;
  title: string;
  company_name: string;
  location: string | null;
  saved_at: string;
}

function JobDetailSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <Skeleton className="mb-4 h-8 w-64" />
      <Skeleton className="mb-8 h-5 w-96" />
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
        <Skeleton className="h-72 rounded-xl" />
      </div>
    </div>
  );
}

function JobDetailError({ message = 'This job may have been removed or is no longer active.' }: { message?: string }) {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 text-center">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-muted/50">
        <Briefcase className="h-10 w-10 text-muted-foreground" />
      </div>
      <h1 className="text-2xl font-bold">Unable to load job</h1>
      <p className="mt-2 text-muted-foreground">{message}</p>
      <Button onClick={() => router.push('/jobs')} className="mt-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Jobs
      </Button>
    </div>
  );
}

function formatAppliedDate(application: CandidateApplication) {
  return new Date(application.applied_at ?? application.created_at).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function SaveJobButton({ job }: { job: JobListing }) {
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    function syncSavedState() {
      try {
        const stored = localStorage.getItem('hireme_saved_jobs');
        const savedJobs: SavedJob[] = stored ? JSON.parse(stored) : [];
        setIsSaved(savedJobs.some((savedJob) => savedJob.id === job.id));
      } catch {
        setIsSaved(false);
      }
    }

    syncSavedState();
    window.addEventListener('hireme_saved_jobs_updated', syncSavedState);

    return () => {
      window.removeEventListener('hireme_saved_jobs_updated', syncSavedState);
    };
  }, [job.id]);

  function toggleSave() {
    try {
      const stored = localStorage.getItem('hireme_saved_jobs');
      const savedJobs: SavedJob[] = stored ? JSON.parse(stored) : [];

      if (isSaved) {
        localStorage.setItem(
          'hireme_saved_jobs',
          JSON.stringify(savedJobs.filter((savedJob) => savedJob.id !== job.id)),
        );
        setIsSaved(false);
      } else {
        const nextSavedJob: SavedJob = {
          id: job.id,
          title: job.title,
          company_name: job.company_name ?? '',
          location: job.location,
          saved_at: new Date().toISOString(),
        };

        localStorage.setItem(
          'hireme_saved_jobs',
          JSON.stringify([nextSavedJob, ...savedJobs.filter((savedJob) => savedJob.id !== job.id)]),
        );
        setIsSaved(true);
      }

      window.dispatchEvent(new Event('hireme_saved_jobs_updated'));
    } catch {
      // Ignore storage errors so the rest of the page still works.
    }
  }

  return (
    <button
      type="button"
      onClick={toggleSave}
      className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border/60 px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
    >
      <Heart className={isSaved ? 'h-4 w-4 fill-red-500 text-red-500' : 'h-4 w-4 text-muted-foreground'} />
      {isSaved ? 'Saved' : 'Save'}
    </button>
  );
}

function JobMetaInfo({ job }: { job: JobListing }) {
  return (
    <div className="border-t pt-4 flex flex-col gap-3">
      {job.application_deadline ? (
        <div className="flex items-start gap-2 text-sm">
          <Calendar className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">Application Deadline</p>
            <p className="text-muted-foreground">
              {new Date(job.application_deadline).toLocaleDateString('en-GB', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </p>
          </div>
        </div>
      ) : null}
      <div className="flex items-start gap-2 text-sm">
        <Clock className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
        <div>
          <p className="font-medium">Date Posted</p>
          <p className="text-muted-foreground">
            {new Date(job.created_at).toLocaleDateString('en-GB', {
              day: 'numeric', month: 'long', year: 'numeric',
            })}
          </p>
        </div>
      </div>
    </div>
  );
}

function ApplySidebar({
  job,
  isAuthenticated,
  isAlreadyApplied,
  existingApplication,
  isCheckingApplication,
}: {
  job: JobListing;
  isAuthenticated: boolean;
  isAlreadyApplied: boolean;
  existingApplication: CandidateApplication | null;
  isCheckingApplication: boolean;
}) {
  const router = useRouter();

  if (job.status === JobStatus.CLOSED) {
    return (
      <div className="rounded-xl border bg-card shadow-sm p-6 flex flex-col gap-4">
        <div className="rounded-lg bg-[#FFE2E2] border border-[#FECACA] px-4 py-3 text-sm text-[#991B1B] font-medium text-center">
          This position is no longer accepting applications
        </div>

        {isAlreadyApplied ? (
          <>
            <div className="rounded-lg bg-primary-light border border-primary-border px-4 py-3 text-sm text-primary-text text-center">
              You applied for this position
              {existingApplication ? (
                <span className="block text-xs mt-1 opacity-75">
                  on {formatAppliedDate(existingApplication)}
                </span>
              ) : null}
            </div>
            <Link
              href="/applications"
              className="w-full py-2.5 rounded-lg border text-sm font-medium text-center text-primary border-primary-border hover:bg-primary-light transition-colors block"
            >
              View My Application →
            </Link>
          </>
        ) : null}

        <JobMetaInfo job={job} />
      </div>
    );
  }

  if (isAlreadyApplied) {
    return (
      <div className="rounded-xl border bg-card shadow-sm p-6 flex flex-col gap-4">
        <button
          disabled
          className="w-full py-3 rounded-lg bg-primary-light text-primary-text font-semibold cursor-not-allowed border border-primary-border flex items-center justify-center gap-2 text-sm"
        >
          <CheckCircle className="w-5 h-5" />
          Already Applied
        </button>
        {existingApplication ? (
          <p className="text-xs text-center text-muted-foreground">
            Applied on {formatAppliedDate(existingApplication)}
          </p>
        ) : null}
        <Link
          href="/applications"
          className="w-full py-2.5 rounded-lg border text-sm font-medium text-center text-primary border-primary-border hover:bg-primary-light transition-colors block"
        >
          View My Application →
        </Link>
        <SaveJobButton job={job} />
        <JobMetaInfo job={job} />
      </div>
    );
  }

  if (isAuthenticated && isCheckingApplication) {
    return (
      <div className="rounded-xl border bg-card shadow-sm p-6 flex flex-col gap-4">
        <Button disabled className="w-full py-3 rounded-lg bg-muted text-muted-foreground font-semibold cursor-not-allowed text-sm">
          Checking application status...
        </Button>
        <SaveJobButton job={job} />
        <JobMetaInfo job={job} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="rounded-xl border bg-card shadow-sm p-6 flex flex-col gap-4">
        <Link
          href={`/login?returnTo=${encodeURIComponent(`/jobs/${job.id}`)}`}
          className="w-full py-3 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold text-center transition-colors block text-sm"
        >
          Sign In to Apply
        </Link>
        <SaveJobButton job={job} />
        <JobMetaInfo job={job} />
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card shadow-sm p-6 flex flex-col gap-4">
      <Link
        href={`/jobs/${job.id}/apply`}
        className="w-full py-3 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold text-center transition-colors block text-sm"
      >
        Apply Now
      </Link>
      <div className="flex gap-2">
        <SaveJobButton job={job} />
      </div>
      <JobMetaInfo job={job} />
    </div>
  );
}

export default function JobDetailPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const [job, setJob] = useState<JobListing | null>(null);
  const [existingApplication, setExistingApplication] = useState<CandidateApplication | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingApplication, setIsCheckingApplication] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    let isMounted = true;

    async function loadAll() {
      setIsLoading(true);
      setError(null);
      setExistingApplication(null);
      setIsCheckingApplication(isAuthenticated);

      const jobPromise = jobsApi.getPublicJobById(jobId);
      const applicationsPromise = isAuthenticated
        ? applicationsApi.listCandidateApplications({ page: 1, limit: 100 })
        : Promise.resolve(null);

      jobPromise
        .then((result) => {
          if (isMounted) {
            setJob(result);
            setError(null);
            setIsLoading(false);
          }
        })
        .catch(() => {
          if (isMounted) {
            setJob(null);
            setError('Could not load this job right now. Please try again.');
            setIsLoading(false);
          }
        });

      const [jobResult, applicationsResult] = await Promise.allSettled([
        jobPromise,
        applicationsPromise,
      ]);

      if (!isMounted) {
        return;
      }

      if (jobResult.status === 'rejected') {
        setJob(null);
        setError('Could not load this job right now. Please try again.');
        setIsCheckingApplication(false);
        setIsLoading(false);
        return;
      }

      if (applicationsResult.status === 'fulfilled' && applicationsResult.value) {
        const existing =
          applicationsResult.value.data.find(
            (application) => application.job_id === jobId || application.job?.id === jobId,
          ) ?? null;
        setExistingApplication(existing);
      } else {
        setExistingApplication(null);
      }

      setIsCheckingApplication(false);
    }

    loadAll();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, isHydrated, jobId]);

  if (isLoading) return <JobDetailSkeleton />;
  if (error) return <JobDetailError message={error} />;
  if (!job) return <JobDetailError message="Job not found" />;

  const modeInfo = modeLabels[job.application_mode] || modeLabels[ApplicationMode.STANDARD];
  const ModeIcon = modeInfo.icon;
  const closedBanner = searchParams.get('status') === 'closed';
  const alreadyAppliedBanner = searchParams.get('already_applied') === 'true';
  const hasAlreadyApplied = alreadyAppliedBanner || existingApplication !== null;

  return (
    <div className="flex flex-1 flex-col">
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8 pb-24 sm:px-6 lg:px-8 lg:pb-8 page-enter">
      <Button variant="ghost" size="sm" onClick={() => router.push('/jobs')} className="mb-6 -ml-2 text-muted-foreground">
        <ArrowLeft className="mr-1 h-4 w-4" />
        All Jobs
      </Button>

      {closedBanner ? (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-[#FECACA] bg-[#FFE2E2] px-4 py-3 text-sm text-[#991B1B]">
          <XCircle className="h-4 w-4 shrink-0" />
          This position is closed and no longer accepting applications.
        </div>
      ) : null}

      {alreadyAppliedBanner ? (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-primary-border bg-primary-light px-4 py-3 text-sm text-primary-text">
          <Info className="h-4 w-4 shrink-0" />
          You have already submitted an application for this position.
        </div>
      ) : null}

      <div className="mb-8">
        <div className="mb-4 flex items-center gap-4">
          <CompanyAvatar companyName={job.company_name ?? ''} logoUrl={job.company_logo_url} size="lg" />
          <div>
            {job.company_name ? (
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">{job.company_name}</p>
            ) : null}
            <h1 className="text-3xl font-bold tracking-tight">{job.title}</h1>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          {job.location ? (
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {job.location}
            </span>
          ) : null}
          {job.employment_type ? (
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Briefcase className="h-4 w-4" />
              {job.employment_type.replace('_', ' ')}
            </span>
          ) : null}
          {job.salary_range ? (
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              {job.salary_range}
            </span>
          ) : null}
          {job.application_mode !== ApplicationMode.STANDARD ? (
            <Badge variant="outline" className={`gap-1 font-normal ${modeInfo.color}`}>
              <ModeIcon className="h-4 w-4" />
              {modeInfo.label}
            </Badge>
          ) : null}
        </div>
      </div>

      <div className="mt-8 grid flex-1 grid-cols-1 items-start gap-8 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          {job.status === JobStatus.CLOSED ? (
            <div className="mb-0 rounded-lg border border-[#FECACA] bg-[#FFE2E2] px-4 py-3 text-sm text-[#991B1B] flex items-center gap-2">
              <XCircle className="w-4 h-4 shrink-0" />
              This position is closed and no longer accepting applications.
            </div>
          ) : null}

          <Card className="border-border/40">
            <CardHeader>
              <CardTitle className="text-lg">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{job.description}</p>
            </CardContent>
          </Card>

          {job.requirements ? (
            <Card className="border-border/40">
              <CardHeader>
                <CardTitle className="text-lg">Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{job.requirements}</p>
              </CardContent>
            </Card>
          ) : null}
        </div>

        <div className="lg:sticky lg:top-8">
          <ApplySidebar
            job={job}
            isAuthenticated={isAuthenticated}
            isAlreadyApplied={hasAlreadyApplied}
            existingApplication={existingApplication}
            isCheckingApplication={isCheckingApplication}
          />
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/40 bg-background/95 p-3 backdrop-blur-xl lg:hidden safe-area-inset-bottom">
        {job.status === JobStatus.CLOSED ? (
          <Button disabled className="h-11 w-full cursor-not-allowed border border-[#FECACA] bg-[#FFE2E2] text-[#991B1B] hover:bg-[#FFE2E2]">
            Position Closed
          </Button>
        ) : hasAlreadyApplied ? (
          <Button disabled className="h-11 w-full cursor-not-allowed bg-primary-light text-primary-text border border-primary-border hover:bg-primary-light">
            Already Applied
          </Button>
        ) : isAuthenticated && isCheckingApplication ? (
          <Button disabled className="h-11 w-full cursor-not-allowed bg-muted text-muted-foreground hover:bg-muted">
            Checking application status...
          </Button>
        ) : !isAuthenticated ? (
          <Link
            href={`/login?returnTo=${encodeURIComponent(`/jobs/${job.id}`)}`}
            className="block w-full rounded-lg bg-primary px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
          >
            Sign In to Apply
          </Link>
        ) : (
          <Button
            className="h-11 w-full bg-primary hover:bg-primary-hover text-white"
            onClick={() => {
              router.push(`/jobs/${job.id}/apply`);
            }}
          >
            Apply Now
          </Button>
        )}
      </div>
    </div>
    </div>
  );
}


