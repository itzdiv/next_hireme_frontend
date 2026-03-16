'use client';

import { use, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCompanyJob, useUpdateJob, useUpdateJobStatus } from '@/lib/hooks/useJobs';
import { useQuestionBanks } from '@/lib/hooks/useQuestionBanks';
import { useMyCompanies } from '@/lib/hooks/useCompany';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Save, Play, Pause, Globe2, Lock } from 'lucide-react';
import JobStatusBadge from '@/components/jobs/JobStatusBadge';
import { JobVisibility, ApplicationMode, JobStatus, MemberRole } from '@/types';

export default function EditJobPage({ params }: { params: Promise<{ companyId: string; jobId: string }> }) {
  const { companyId, jobId } = use(params);
  const router = useRouter();
  const { data: job, loading: fetching, refetch } = useCompanyJob(companyId, jobId);
  const { data: myCompanies } = useMyCompanies();
  const { data: questionBanks } = useQuestionBanks(companyId, { page: 1, limit: 100 });
  const { mutate: updateJob, loading: updating } = useUpdateJob();
  const { mutate: updateJobStatus, loading: updatingStatus } = useUpdateJobStatus();

  const [draft, setDraft] = useState<Partial<{
    title: string;
    description: string;
    requirements: string;
    location: string;
    employment_type: string;
    salary_range: string;
    visibility: JobVisibility;
    status: JobStatus;
    application_mode: ApplicationMode;
    application_deadline: string;
    question_bank_id: string;
  }>>({});
  const [errors, setErrors] = useState<Partial<Record<'title' | 'description' | 'status' | 'application_mode' | 'question_bank_id' | 'application_deadline', string>>>({});

  const form = {
    title: draft.title ?? job?.title ?? '',
    description: draft.description ?? job?.description ?? '',
    requirements: draft.requirements ?? job?.requirements ?? '',
    location: draft.location ?? job?.location ?? '',
    employment_type: draft.employment_type ?? job?.employment_type ?? 'FULL_TIME',
    salary_range: draft.salary_range ?? job?.salary_range ?? '',
    visibility: draft.visibility ?? job?.visibility ?? JobVisibility.PUBLIC,
    status: draft.status ?? job?.status ?? JobStatus.DRAFT,
    application_mode: draft.application_mode ?? job?.application_mode ?? ApplicationMode.STANDARD,
    application_deadline:
      draft.application_deadline
      ?? (job?.application_deadline ? new Date(job.application_deadline).toISOString().split('T')[0] : ''),
    question_bank_id: draft.question_bank_id ?? (job as { question_bank_id?: string } | null)?.question_bank_id ?? '',
  };
  const originalApplicationDeadline = job?.application_deadline
    ? new Date(job.application_deadline).toISOString().split('T')[0]
    : '';
  const deadlineChanged = form.application_deadline !== originalApplicationDeadline;
  const minDeadlineDate = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }, []);

  const validateForm = () => {
    const nextErrors: Partial<Record<'title' | 'description' | 'status' | 'application_mode' | 'question_bank_id' | 'application_deadline', string>> = {};

    if (!form.title.trim()) {
      nextErrors.title = 'Title is required';
    } else if (form.title.trim().length < 2) {
      nextErrors.title = 'Title must be at least 2 characters';
    }

    if (!form.description.trim()) {
      nextErrors.description = 'Description is required';
    } else if (form.description.trim().length < 10) {
      nextErrors.description = 'Description must be at least 10 characters';
    }

    if (![JobStatus.DRAFT, JobStatus.ACTIVE, JobStatus.CLOSED].includes(form.status)) {
      nextErrors.status = 'Please select a valid status';
    }

    if (![ApplicationMode.STANDARD, ApplicationMode.QUESTIONNAIRE, ApplicationMode.VIDEO].includes(form.application_mode)) {
      nextErrors.application_mode = 'Please select a valid application mode';
    }

    if (form.application_mode === ApplicationMode.QUESTIONNAIRE && !form.question_bank_id) {
      nextErrors.question_bank_id = 'Please select a question bank for questionnaire mode';
    }

    if (deadlineChanged && form.application_deadline) {
      const selectedDate = new Date(`${form.application_deadline}T00:00:00`);
      const today = new Date();
      selectedDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      if (selectedDate <= today) {
        nextErrors.application_deadline = 'Application deadline must be a future date';
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      await updateJob(companyId, jobId, {
        ...form,
        requirements: form.requirements || undefined,
        location: form.location || undefined,
        salary_range: form.salary_range || undefined,
        application_deadline: form.application_deadline
          ? new Date(form.application_deadline).toISOString()
          : undefined,
        question_bank_id:
          form.application_mode === ApplicationMode.QUESTIONNAIRE && form.question_bank_id
            ? form.question_bank_id
            : undefined,
      });
      toast.success('Job updated successfully');
      router.push(`/companies/${companyId}/jobs`);
    } catch {
      toast.error('Failed to update job');
    }
  };

  if (fetching) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-150 rounded-xl" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg font-semibold">Job not found</p>
        <p className="mt-1 text-sm text-muted-foreground">This job does not exist or you don&apos;t have access.</p>
        <Link href={`/companies/${companyId}/jobs`} className="mt-4 text-sm text-blue-600 hover:text-blue-500">
          â† Back to Jobs
        </Link>
      </div>
    );
  }

  const selectedQuestionBank = questionBanks?.data.find((questionBank) => questionBank.id === form.question_bank_id);
  const currentMembership = myCompanies.find((membership) => membership.company_id === companyId);
  const canManageStatus =
    currentMembership?.status === 'ACTIVE'
    && [MemberRole.OWNER, MemberRole.ADMIN, MemberRole.RECRUITER].includes(currentMembership.role);

  const getPrimaryStatusAction = (status: JobStatus) => {
    if (status === JobStatus.DRAFT) return { label: 'Publish', next: JobStatus.ACTIVE, icon: Play };
    if (status === JobStatus.ACTIVE) return { label: 'Close Hiring', next: JobStatus.CLOSED, icon: Pause };
    return { label: 'Reopen', next: JobStatus.ACTIVE, icon: Play };
  };

  const handleQuickStatusChange = async (newStatus: JobStatus) => {
    try {
      await updateJobStatus(companyId, jobId, { status: newStatus });
      toast.success(`Job marked as ${newStatus}`);
      refetch();
    } catch {
      toast.error('Failed to update job status');
    }
  };

  const primaryStatusAction = getPrimaryStatusAction(job.status);
  const PrimaryStatusIcon = primaryStatusAction.icon;

  return (
    <div>
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="-ml-2 text-muted-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Jobs
        </Button>
      </div>

      <div className="mb-8 space-y-3">
        <h1 className="text-3xl font-bold">Edit Job: {job.title}</h1>
        <p className="mt-2 text-muted-foreground">Modify the details of this job listing.</p>
        <div className="flex flex-wrap items-center gap-2">
          <JobStatusBadge status={job.status} />
          <Badge variant="outline" className="gap-1.5">
            {job.visibility === JobVisibility.PUBLIC ? (
              <>
                <Globe2 className="h-3.5 w-3.5 text-emerald-600" />
                Public
              </>
            ) : (
              <>
                <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                Private
              </>
            )}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            disabled={!canManageStatus || updatingStatus}
            onClick={() => handleQuickStatusChange(primaryStatusAction.next)}
          >
            <PrimaryStatusIcon className="mr-1.5 h-3.5 w-3.5" />
            {primaryStatusAction.label}
          </Button>
        </div>
      </div>

      <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => {
                  setDraft((current) => ({ ...current, title: e.target.value }));
                  setErrors((current) => ({ ...current, title: undefined }));
                }}
                required
              />
              {errors.title ? <p className="text-xs text-destructive">{errors.title}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => {
                  setDraft((current) => ({ ...current, description: e.target.value }));
                  setErrors((current) => ({ ...current, description: undefined }));
                }}
                rows={6}
                required
              />
              {errors.description ? <p className="text-xs text-destructive">{errors.description}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements">Requirements</Label>
              <Textarea
                id="requirements"
                value={form.requirements}
                onChange={(e) => setDraft((current) => ({ ...current, requirements: e.target.value }))}
                rows={4}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={form.location}
                  onChange={(e) => setDraft((current) => ({ ...current, location: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="salary_range">Salary Range</Label>
                <Input
                  id="salary_range"
                  value={form.salary_range}
                  onChange={(e) => setDraft((current) => ({ ...current, salary_range: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="employment_type">Employment Type</Label>
                <Select
                  value={form.employment_type}
                  onValueChange={(val) => setDraft((current) => ({
                    ...current,
                    employment_type: val ?? current.employment_type ?? 'FULL_TIME',
                  }))}
                >
                  <SelectTrigger id="employment_type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FULL_TIME">Full Time</SelectItem>
                    <SelectItem value="PART_TIME">Part Time</SelectItem>
                    <SelectItem value="CONTRACT">Contract</SelectItem>
                    <SelectItem value="INTERNSHIP">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline">Application Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={form.application_deadline}
                  min={deadlineChanged || !originalApplicationDeadline ? minDeadlineDate : undefined}
                  onChange={(e) => {
                    setDraft((current) => ({ ...current, application_deadline: e.target.value }));
                    setErrors((current) => ({ ...current, application_deadline: undefined }));
                  }}
                />
                {errors.application_deadline ? <p className="text-xs text-destructive">{errors.application_deadline}</p> : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="visibility">Visibility</Label>
                <Select
                  value={form.visibility}
                  onValueChange={(val) => {
                    if (!val) return;
                    setDraft((current) => ({ ...current, visibility: val as JobVisibility }));
                  }}
                >
                  <SelectTrigger id="visibility">
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={JobVisibility.PUBLIC}>Public</SelectItem>
                    <SelectItem value={JobVisibility.PRIVATE}>Private</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Private jobs won&apos;t appear on the public job board.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(val) => {
                    if (!val) return;
                    setDraft((current) => ({ ...current, status: val as JobStatus }));
                    setErrors((current) => ({ ...current, status: undefined }));
                  }}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={JobStatus.DRAFT}>Draft</SelectItem>
                    <SelectItem value={JobStatus.ACTIVE}>Active</SelectItem>
                    <SelectItem value={JobStatus.CLOSED}>Closed</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status ? <p className="text-xs text-destructive">{errors.status}</p> : null}
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="application_mode">Application Mode</Label>
                <Select
                  value={form.application_mode}
                  onValueChange={(val) => {
                    if (!val) return;
                    const nextMode = val as ApplicationMode;
                    setDraft((current) => ({
                      ...current,
                      application_mode: nextMode,
                      question_bank_id: nextMode === ApplicationMode.QUESTIONNAIRE ? (current.question_bank_id ?? form.question_bank_id) : '',
                    }));
                    setErrors((current) => ({
                      ...current,
                      application_mode: undefined,
                      question_bank_id: nextMode === ApplicationMode.QUESTIONNAIRE ? current.question_bank_id : undefined,
                    }));
                  }}
                >
                  <SelectTrigger id="application_mode">
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ApplicationMode.STANDARD}>Standard (Resume only)</SelectItem>
                    <SelectItem value={ApplicationMode.QUESTIONNAIRE}>Questionnaire (Resume + Screening Questions)</SelectItem>
                    <SelectItem value={ApplicationMode.VIDEO}>Video (Resume + Video Submission)</SelectItem>
                  </SelectContent>
                </Select>
                {errors.application_mode ? <p className="text-xs text-destructive">{errors.application_mode}</p> : null}
              </div>
            </div>

            {form.application_mode === ApplicationMode.QUESTIONNAIRE ? (
              <div className="mt-5 rounded-xl border border-border/40 bg-muted/20 p-4">
                <p className="text-sm font-semibold">Question Bank Selector</p>
                <p className="text-xs text-muted-foreground">Questions will be snapshot-copied from the selected bank.</p>
                <div className="mt-3 space-y-2">
                  <Label htmlFor="question_bank_id">Question Bank</Label>
                  <Select
                    value={form.question_bank_id}
                    onValueChange={(value) => {
                      setDraft((current) => ({ ...current, question_bank_id: value ?? '' }));
                      setErrors((current) => ({ ...current, question_bank_id: undefined }));
                    }}
                  >
                    <SelectTrigger id="question_bank_id">
                      <SelectValue placeholder="Select a question bank" />
                    </SelectTrigger>
                    <SelectContent>
                      {(questionBanks?.data ?? []).map((questionBank) => (
                        <SelectItem key={questionBank.id} value={questionBank.id}>
                          {questionBank.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.question_bank_id ? <p className="text-xs text-destructive">{errors.question_bank_id}</p> : null}
                </div>
                {selectedQuestionBank ? (
                  <div className="mt-3 space-y-3">
                    <div className="rounded-xl border border-amber-300/50 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
                      âš ï¸ Questions are copied at job creation time. Editing this question bank later will NOT affect this job.
                    </div>
                    <div className="rounded-xl border border-border/40 bg-background px-4 py-3 text-sm text-muted-foreground">
                      {selectedQuestionBank.questions_json.length} question{selectedQuestionBank.questions_json.length === 1 ? '' : 's'} will be attached.
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 rounded-xl border border-dashed border-border/60 px-4 py-3 text-sm text-muted-foreground">
                    {(questionBanks?.data ?? []).length > 0 ? (
                      'No question bank selected yet.'
                    ) : (
                      <>
                        No question banks found. Create one first in
                        <Link href={`/companies/${companyId}/question-banks`} className="ml-1 text-blue-600 hover:text-blue-500">
                          Question Banks
                        </Link>
                        .
                      </>
                    )}
                  </div>
                )}
              </div>
            ) : null}

            {form.application_mode === ApplicationMode.VIDEO ? (
              <div className="mt-5 rounded-xl border border-border/40 bg-muted/20 p-4 text-sm text-muted-foreground">
                Candidates will be asked to submit a video URL with their application.
              </div>
            ) : null}
          </CardContent>
          <CardFooter className="flex justify-end gap-3 bg-muted/20 border-t border-border/40 pt-6">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={updating}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updating}
              className="bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
            >
              {updating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Changes
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}


