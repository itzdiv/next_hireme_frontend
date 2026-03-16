'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ApplicationStatusBadge from '@/components/applications/ApplicationStatusBadge';
import { useWithdrawApplication } from '@/lib/hooks/useApplications';
import { ApplicationMode, ApplicationStatus, CandidateApplication } from '@/types';
import {
  Building2,
  Calendar,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from 'lucide-react';

interface CandidateApplicationCardProps {
  application: CandidateApplication;
  onWithdraw: (applicationId: string) => void;
}

function renderAnswer(value: unknown): string {
  if (value === undefined || value === null || value === '') return 'Not answered';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
}

export function CandidateApplicationCard({ application, onWithdraw }: CandidateApplicationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);
  const { mutate: withdrawApplication, loading: isWithdrawing } = useWithdrawApplication();

  const job = application.job;
  const jobLinkId = application.job_id || job.id;
  const visibleComments = application.comments ?? [];
  const canWithdraw = application.status === ApplicationStatus.APPLIED;

  const appliedDate = useMemo(() => {
    const baseDate = application.applied_at ?? application.created_at;
    return new Date(baseDate).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }, [application.applied_at, application.created_at]);

  const handleWithdraw = async () => {
    try {
      await withdrawApplication(application.id);
      onWithdraw(application.id);
      toast.success('Application withdrawn successfully');
    } catch {
      toast.error('Failed to withdraw application');
    } finally {
      setShowWithdrawConfirm(false);
    }
  };

  return (
    <div className="rounded-xl border border-border/50 bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-base font-bold text-blue-600">
              {job.company_name?.[0]?.toUpperCase() ?? '?'}
            </div>

            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold leading-tight">
                {job.title}
              </h3>
              <span className="truncate text-sm text-muted-foreground block">
                {job.company_name}
              </span>
            </div>
          </div>

          <ApplicationStatusBadge status={application.status} />
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            Applied {appliedDate}
          </span>

          {job.application_mode === ApplicationMode.QUESTIONNAIRE ? (
              <Badge variant="outline" className="border-primary-border bg-primary-light text-primary-text">
              Questionnaire
            </Badge>
          ) : null}

          {job.application_mode === ApplicationMode.VIDEO ? (
            <Badge variant="outline" className="border-orange-200 bg-orange-50 text-orange-700">
              Video
            </Badge>
          ) : null}
        </div>

        {visibleComments.length > 0 ? (
          <div className="flex flex-col gap-2 rounded-lg border border-primary-border bg-primary-light p-3">
            <span className="text-xs font-medium uppercase tracking-wide text-primary-text">
              Recruiter Feedback
            </span>
            {visibleComments.map((comment) => (
              <p key={comment.id} className="text-sm text-blue-700">
                &quot;{comment.comment}&quot;
              </p>
            ))}
          </div>
        ) : null}

        {application.status === ApplicationStatus.ACCEPTED ? (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800">
            Congratulations! Your application has been accepted.
          </div>
        ) : null}

        {application.status === ApplicationStatus.REJECTED ? (
          <div className="rounded-lg border bg-muted px-4 py-3 text-sm text-muted-foreground">
            This application was not selected. Keep applying!
          </div>
        ) : null}

        {application.status === ApplicationStatus.WITHDRAWN ? (
          <div className="rounded-lg border bg-muted px-4 py-3 text-sm text-muted-foreground">
            You withdrew this application.
          </div>
        ) : null}

        {isExpanded ? (
          <div className="flex flex-col gap-3 border-t pt-4">
            {application.answers_json &&
            job.application_mode === ApplicationMode.QUESTIONNAIRE &&
            job.screening_questions_json?.length ? (
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium">Your Answers</span>
                {job.screening_questions_json.map((question) => (
                  <div key={question.id} className="flex flex-col gap-0.5">
                    <span className="text-xs text-muted-foreground">{question.question}</span>
                    <span className="text-sm">{renderAnswer(application.answers_json?.[question.id])}</span>
                  </div>
                ))}
              </div>
            ) : null}

            {application.video_url && job.application_mode === ApplicationMode.VIDEO ? (
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium">Your Video Submission</span>
                <a
                  href={application.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-500"
                >
                  Watch Video <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            ) : null}

            {jobLinkId ? (
              <Link href={`/jobs/${jobLinkId}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                View job posting <Building2 className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                Job posting unavailable <Building2 className="h-3.5 w-3.5" />
              </span>
            )}
          </div>
        ) : null}

        <div className="flex flex-col gap-2 border-t pt-2 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => setIsExpanded((current) => !current)}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {isExpanded ? (
              <>
                Hide Details <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                View Details <ChevronDown className="h-4 w-4" />
              </>
            )}
          </button>

          {canWithdraw ? (
            showWithdrawConfirm ? (
              <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
                <span className="text-sm text-muted-foreground">Are you sure?</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowWithdrawConfirm(false)}
                  disabled={isWithdrawing}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={handleWithdraw}
                  disabled={isWithdrawing}
                >
                  {isWithdrawing ? 'Withdrawing...' : 'Confirm Withdraw'}
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setShowWithdrawConfirm(true)}
                className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 sm:w-auto"
              >
                Withdraw
              </Button>
            )
          ) : null}
        </div>
      </div>
    </div>
  );
}


