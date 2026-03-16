'use client';

import { use, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useProfile } from '@/lib/hooks/useCandidate';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { ApplyStepContent } from './_components/ApplyStepContent';
import { ApplyStepIndicator } from './_components/ApplyStepIndicator';
import { useApplyToJobFlow } from './_components/useApplyToJobFlow';
import { JobStatus } from '@/types';

export default function ApplyToJobPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = use(params);
  const flow = useApplyToJobFlow(jobId);
  const pathname = usePathname();
  const { loading: loadingProfile, notFound } = useProfile();
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    if (loadingProfile || !notFound || hasRedirectedRef.current) return;

    hasRedirectedRef.current = true;
    toast.info('Please complete your profile before applying.');
    const returnTo = pathname || `/jobs/${jobId}/apply`;
    flow.router.push(`/profile?returnTo=${encodeURIComponent(returnTo)}`);
  }, [flow.router, jobId, loadingProfile, notFound, pathname]);

  if (flow.loadingJob || flow.checkingExistingApplication || loadingProfile) {
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

  if (notFound) {
    return null;
  }

  if (!flow.job) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h1 className="text-2xl font-bold">Job not found</h1>
          <p className="mt-2 text-muted-foreground">This listing may be removed or unavailable.</p>
          <Button className="mt-6" onClick={() => flow.router.push('/jobs')}>
            Back to Jobs
          </Button>
        </div>
      </div>
    );
  }

  if (flow.job.status === JobStatus.CLOSED) {
    return null;
  }

  const job = flow.job;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 page-enter">
        <Button variant="ghost" size="sm" onClick={() => flow.router.push(`/jobs/${job.id}`)} className="-ml-2 mb-4 text-muted-foreground">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Job
        </Button>

        <h1 className="text-3xl font-bold tracking-tight">Apply to {job.title}</h1>
        <p className="mt-2 text-muted-foreground">Complete all steps to submit your application.</p>

        <ApplyStepIndicator step={flow.step} steps={flow.steps} onStepClick={flow.goToStep} />

        <ApplyStepContent
          step={flow.step}
          errors={flow.errors}
          loadingResumes={flow.loadingResumes}
          resumes={flow.resumes}
          activeResumeId={flow.activeResumeId}
          job={flow.job}
          questions={flow.questions}
          answers={flow.answers}
          videoUrl={flow.videoUrl}
          selectedResume={flow.selectedResume}
          isQuestionnaireMode={flow.isQuestionnaireMode}
          isVideoMode={flow.isVideoMode}
          isStandardMode={flow.isStandardMode}
          resumeReturnToHref={`/resumes?returnTo=${encodeURIComponent(`/jobs/${jobId}/apply`)}`}
          onSelectResume={flow.setSelectedResumeId}
          onClearResumeError={() => flow.setErrors((current) => ({ ...current, resume_id: undefined, summary: undefined }))}
          onAnswerChange={flow.handleAnswerChange}
          onVideoUrlChange={flow.setVideoUrl}
          onClearVideoError={() => flow.setErrors((current) => ({ ...current, video_url: undefined, summary: undefined }))}
          onGoToApplications={() => flow.router.push('/applications')}
          onGoToJobs={() => flow.router.push('/jobs')}
        />

        {flow.step < 4 ? (
          <div className="mt-6 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => flow.setStep((current) => (Math.max(1, current - 1) as 1 | 2 | 3 | 4))}
              disabled={flow.step === 1 || flow.submitting}
            >
              Back
            </Button>

            {flow.step < flow.reviewStep ? (
              <Button
                className="btn-gradient"
                onClick={() => {
                  const valid = flow.step === 1 ? flow.validateStep(1) : flow.validateStep(2);
                  if (!valid) return;
                  flow.setStep((current) => (Math.min(flow.reviewStep, current + 1) as 1 | 2 | 3 | 4));
                }}
                disabled={flow.submitting || (flow.step === 1 && !flow.activeResumeId)}
              >
                Next
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button className="btn-gradient" onClick={flow.handleSubmit} disabled={flow.submitting}>
                {flow.submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Submit Application
              </Button>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}