'use client';

import { useEffect, useState } from 'react';
import ApplicationStatusBadge from '@/components/applications/ApplicationStatusBadge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Calendar,
  Briefcase,
  X,
  Mail,
  FileText,
  ExternalLink,
  ClipboardList,
  Video,
  Loader2,
} from 'lucide-react';
import {
  Phone,
  Linkedin,
  Globe,
  User,
} from 'lucide-react';
import {
  ApplicationMode,
  ApplicationStatus,
  CompanyApplicationDetail,
  ApplicationComment,
  Question,
} from '@/types';
import {
  useAddComment,
  useApplicationResumeDownload,
  useComments,
  useUpdateApplicationStatus,
} from '@/lib/hooks/useApplications';
import { getCompanyApplicationDetail } from '@/lib/api/applications';
import { toast } from 'sonner';

interface ApplicationReviewModalProps {
  companyId: string;
  application: CompanyApplicationDetail | null;
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

type ReviewTab = 'application' | 'comments';

function CommentsList({ comments }: { comments: ApplicationComment[] }) {
  if (comments.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No comments yet. Add the first note below.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {comments.map((comment) => (
        <div key={comment.id} className="flex flex-col gap-1 rounded-lg border p-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium">{comment.user_email ?? 'Team Member'}</span>
            <div className="flex items-center gap-2">
              {comment.visible_to_candidate ? (
                <span className="rounded-full border border-primary-border bg-primary-light px-2 py-0.5 text-xs text-primary-text">
                  Visible to candidate
                </span>
              ) : (
                <span className="rounded-full border bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  Internal
                </span>
              )}
              <span className="text-xs text-muted-foreground">
                {new Date(comment.created_at).toLocaleDateString('en-GB')}
              </span>
            </div>
          </div>
          <p className="text-sm text-foreground">{comment.comment}</p>
        </div>
      ))}
    </div>
  );
}

function ScreeningAnswersPanel({
  questions,
  answers,
}: {
  questions: Question[];
  answers: Record<string, unknown>;
}) {
  if (questions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No screening questions were attached to this job.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {questions.map((question, index) => {
        const answer = answers[question.id];
        const hasAnswer = answer !== undefined && answer !== null && answer !== '';
        const isOptional = question.is_required === false;

        return (
          <div key={question.id} className="flex flex-col gap-1.5">
            <div className="flex items-start gap-1.5">
              <span className="mt-0.5 shrink-0 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Q{index + 1}
              </span>
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="text-sm font-medium leading-snug">{question.question}</span>
                {isOptional && (
                  <span className="text-xs text-muted-foreground">Optional</span>
                )}
              </div>
            </div>
            {hasAnswer ? (
              <div className="ml-5 rounded-md bg-muted px-3 py-2 text-sm">{String(answer)}</div>
            ) : (
              <p className="ml-5 text-sm italic text-muted-foreground">Not answered</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function ApplicationReviewModal({ companyId, application, isOpen, onClose, onRefresh }: ApplicationReviewModalProps) {
  const [activeTab, setActiveTab] = useState<ReviewTab>('application');
  const [newComment, setNewComment] = useState('');
  const [visibleToCandidate, setVisibleToCandidate] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [localApplication, setLocalApplication] = useState<CompanyApplicationDetail | null>(application);
  const [detail, setDetail] = useState<CompanyApplicationDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const { data: comments = [], refetch: refetchComments } = useComments(
    companyId,
    localApplication?.id ?? null,
  );
  const { mutate: addComment, loading: postingComment } = useAddComment();
  const { mutate: updateStatus } = useUpdateApplicationStatus();
  const { mutate: getResumeDownload, loading: openingResume } = useApplicationResumeDownload();

  useEffect(() => {
    const resetId = window.setTimeout(() => {
      setLocalApplication(application);
      setActiveTab('application');
      setNewComment('');
      setVisibleToCandidate(false);
      setCommentError(null);
      setStatusUpdating(false);
    }, 0);

    return () => window.clearTimeout(resetId);
  }, [application, isOpen]);

  useEffect(() => {
    if (!isOpen || !application) {
      setDetail(null);
      return;
    }

    const appId = application.id;
    let cancelled = false;

    async function loadDetail() {
      try {
        setIsLoadingDetail(true);
        const data = await getCompanyApplicationDetail(companyId, appId);
        if (!cancelled) {
          setDetail(data);
          setLocalApplication((current) => (current ? { ...current, ...data } : data));
        }
      } catch {
        // Non-critical — modal still shows basic info without profile details
      } finally {
        if (!cancelled) setIsLoadingDetail(false);
      }
    }

    void loadDetail();
    return () => { cancelled = true; };
  }, [isOpen, application?.id, companyId]);

  if (!localApplication) {
    return null;
  }

  const resolvedApplication = detail ?? localApplication;

  const commentsCount = comments.length;

  const handleOpenResume = async () => {
    try {
      const signed = await getResumeDownload(companyId, localApplication.id);
      window.open(signed.download_url, '_blank', 'noopener,noreferrer');
    } catch {
      toast.error('Failed to open resume');
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim()) {
      return;
    }

    try {
      setCommentError(null);
      await addComment(companyId, localApplication.id, {
        comment: newComment.trim(),
        visible_to_candidate: visibleToCandidate,
      });
      setNewComment('');
      setVisibleToCandidate(false);
      await refetchComments();
      onRefresh();
      toast.success('Comment added');
    } catch {
      setCommentError('Failed to add comment. Please try again.');
    }
  };

  const handleStatusChange = async (
    status: ApplicationStatus.ACCEPTED | ApplicationStatus.REJECTED,
  ) => {
    const previousStatus = localApplication.status;

    try {
      setStatusUpdating(true);
      setLocalApplication((current) => (current ? { ...current, status } : current));
      await updateStatus(companyId, localApplication.id, { status });
      onRefresh();
      toast.success(`Candidate marked as ${status.toLowerCase()}`);
      setTimeout(() => {
        onClose();
      }, 800);
    } catch {
      setLocalApplication((current) => (current ? { ...current, status: previousStatus } : current));
      toast.error('Failed to update status');
      setStatusUpdating(false);
      return;
    }

    setStatusUpdating(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="w-[calc(100%-2rem)] max-w-2xl sm:max-w-2xl p-0 max-h-[85vh] overflow-hidden data-open:duration-200 data-open:fade-in-0 data-open:zoom-in-95"
        showCloseButton={false}
      >
        <div className="flex h-full max-h-[85vh] flex-col">
          <DialogHeader className="relative border-b p-6 pb-5">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 rounded-md p-1 transition-colors hover:bg-muted"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center justify-between gap-3 pr-10">
              <ApplicationStatusBadge status={localApplication.status} />
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {new Date(localApplication.created_at).toLocaleDateString('en-GB')}
              </span>
            </div>

            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
                {(detail?.candidate_name ?? localApplication.candidate_email)?.[0]?.toUpperCase() ?? '?'}
              </div>
              <div className="min-w-0 flex-1">
                {detail?.candidate_name ? (
                  <>
                    <DialogTitle className="truncate text-base font-semibold leading-tight">
                      {detail.candidate_name}
                    </DialogTitle>
                    <span className="block truncate text-sm text-muted-foreground">
                      {localApplication.candidate_email}
                    </span>
                  </>
                ) : (
                  <DialogTitle className="break-all text-base font-semibold">
                    {localApplication.candidate_email}
                  </DialogTitle>
                )}
                <span className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
                  <Briefcase className="h-3.5 w-3.5 shrink-0" />
                  <span className="wrap-break-word">{localApplication.job_title}</span>
                </span>
              </div>
            </div>
          </DialogHeader>

          <div className="flex border-b px-6">
            <button
              type="button"
              onClick={() => setActiveTab('application')}
              className={`border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === 'application'
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Application
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('comments')}
              className={`ml-3 border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === 'comments'
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Comments
              {commentsCount > 0 ? (
                <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-xs">
                  {commentsCount}
                </span>
              ) : null}
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-6">
            {activeTab === 'application' ? (
              <div className="flex flex-col gap-4">
                {/* ── CANDIDATE INFO ── */}
                <section className="flex flex-col gap-3 rounded-lg border p-4">
                  <h3 className="flex items-center gap-2 text-sm font-semibold">
                    <User className="h-4 w-4 text-[#2563EB]" />
                    Candidate Info
                  </h3>
                  <div className="flex items-center gap-2.5 text-sm">
                    <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <a
                      href={`mailto:${localApplication.candidate_email}`}
                      className="truncate text-[#2563EB] hover:underline"
                    >
                      {localApplication.candidate_email}
                    </a>
                  </div>
                  {detail?.candidate_phone && (
                    <div className="flex items-center gap-2.5 text-sm">
                      <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span>{detail.candidate_phone}</span>
                    </div>
                  )}
                  {detail?.candidate_linkedin_url && (
                    <div className="flex items-center gap-2.5 text-sm">
                      <Linkedin className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <a
                        href={detail.candidate_linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="truncate text-[#2563EB] hover:underline"
                      >
                        LinkedIn Profile
                      </a>
                    </div>
                  )}
                  {detail?.candidate_portfolio_url && (
                    <div className="flex items-center gap-2.5 text-sm">
                      <Globe className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <a
                        href={detail.candidate_portfolio_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="truncate text-[#2563EB] hover:underline"
                      >
                        Portfolio / Website
                      </a>
                    </div>
                  )}
                  {isLoadingDetail && (
                    <p className="text-xs text-muted-foreground">Loading profile details...</p>
                  )}
                  {!isLoadingDetail && detail && !detail.candidate_phone && !detail.candidate_linkedin_url && !detail.candidate_portfolio_url && (
                    <p className="text-xs italic text-muted-foreground">
                      Candidate has not added contact details to their profile.
                    </p>
                  )}
                </section>

                {/* ── RESUME ── */}
                <section className="flex flex-col gap-2 rounded-lg border p-4">
                  <h3 className="flex items-center gap-2 text-sm font-semibold">
                    <FileText className="h-4 w-4 text-emerald-600" />
                    Resume
                  </h3>
                  {localApplication.resume_url ? (
                    <button
                      type="button"
                      onClick={handleOpenResume}
                      disabled={openingResume}
                      className="group flex items-center justify-between rounded-md border px-3 py-2 text-sm transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <span>{openingResume ? 'Opening resume...' : 'View PDF Resume'}</span>
                      {openingResume ? (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      ) : (
                        <ExternalLink className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
                      )}
                    </button>
                  ) : (
                    <p className="text-sm text-muted-foreground">No resume attached</p>
                  )}
                </section>

                {/* ── SCREENING ANSWERS ── */}
                {resolvedApplication.application_mode === ApplicationMode.QUESTIONNAIRE && (
                  <section className="flex flex-col gap-3 rounded-lg border p-4">
                    <h3 className="flex items-center gap-2 text-sm font-semibold">
                      <ClipboardList className="h-4 w-4 text-[#2563EB]" />
                      Screening Answers
                    </h3>
                    {isLoadingDetail ? (
                      <p className="text-sm text-muted-foreground">Loading answers...</p>
                    ) : (
                      <ScreeningAnswersPanel
                        questions={resolvedApplication.screening_questions_json ?? []}
                        answers={resolvedApplication.answers_json ?? {}}
                      />
                    )}
                  </section>
                )}

                {/* ── VIDEO SUBMISSION ── */}
                {resolvedApplication.application_mode === ApplicationMode.VIDEO && (
                  <section className="flex flex-col gap-2 rounded-lg border p-4">
                    <h3 className="flex items-center gap-2 text-sm font-semibold">
                      <Video className="h-4 w-4 text-orange-600" />
                      Video Submission
                    </h3>
                    {resolvedApplication.video_url ? (
                      <a
                        href={resolvedApplication.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center justify-between rounded-md border px-3 py-2 text-sm transition-colors hover:bg-muted"
                      >
                        <span>Watch Candidate Video</span>
                        <ExternalLink className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
                      </a>
                    ) : (
                      <p className="text-sm text-muted-foreground">No video submitted</p>
                    )}
                  </section>
                )}
              </div>
            ) : (
              <div className="flex h-full min-h-0 flex-col">
                <div className="min-h-0 flex-1 overflow-y-auto">
                  <CommentsList comments={comments} />
                </div>

                <div className="mt-4 border-t pt-4">
                  <label className="text-sm font-medium">Add a comment</label>
                  <Textarea
                    className="mt-2 min-h-20 resize-none"
                    placeholder="Write a note about this candidate..."
                    value={newComment}
                    onChange={(event) => {
                      setNewComment(event.target.value);
                      if (event.target.value.trim()) {
                        setCommentError(null);
                      }
                    }}
                  />

                  <label className="mt-3 flex cursor-pointer select-none items-center gap-2">
                    <input
                      type="checkbox"
                      checked={visibleToCandidate}
                      onChange={(event) => setVisibleToCandidate(event.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm text-muted-foreground">
                      Visible to candidate
                      <span className="ml-1 text-xs">(they will see this in their application)</span>
                    </span>
                  </label>

                  {commentError ? <p className="mt-2 text-sm text-destructive">{commentError}</p> : null}

                  <Button
                    type="button"
                    onClick={handlePostComment}
                    disabled={!newComment.trim() || postingComment}
                    className="mt-3 ml-auto flex"
                  >
                    {postingComment ? 'Posting...' : 'Post Comment'}
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="sticky bottom-0 rounded-b-xl border-t bg-background p-4">
            {localApplication.status === ApplicationStatus.APPLIED ? (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleStatusChange(ApplicationStatus.REJECTED)}
                  disabled={statusUpdating}
                  className="flex-1 rounded-lg border border-red-200 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {statusUpdating ? 'Updating...' : 'Reject'}
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange(ApplicationStatus.ACCEPTED)}
                  disabled={statusUpdating}
                  className="flex-1 rounded-lg bg-emerald-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {statusUpdating ? 'Updating...' : 'Accept'}
                </button>
              </div>
            ) : (
              <div className="text-center">
                <span className="text-sm text-muted-foreground">
                  This application has been {localApplication.status.toLowerCase()}.
                </span>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

