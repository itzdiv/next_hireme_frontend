'use client';

import { use, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCreateJob } from '@/lib/hooks/useJobs';
import { useQuestionBanks } from '@/lib/hooks/useQuestionBanks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Briefcase, MapPin, DollarSign, Settings2, HelpCircle } from 'lucide-react';
import { JobVisibility, ApplicationMode, JobStatus } from '@/types';

export default function NewJobPage({ params }: { params: Promise<{ companyId: string }> }) {
  const { companyId } = use(params);
  const router = useRouter();
  const { mutate: createJob, loading } = useCreateJob();
  const { data: questionBanks } = useQuestionBanks(companyId, { page: 1, limit: 100 });

  const [form, setForm] = useState({
    title: '',
    description: '',
    requirements: '',
    location: '',
    employment_type: 'FULL_TIME',
    salary_range: '',
    visibility: JobVisibility.PUBLIC,
    status: JobStatus.DRAFT,
    application_mode: ApplicationMode.STANDARD,
    application_deadline: '',
    question_bank_id: '',
  });

  const [errors, setErrors] = useState<Partial<Record<'title' | 'description' | 'status' | 'application_mode' | 'question_bank_id' | 'application_deadline', string>>>({});
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

    if (form.application_deadline) {
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

  const selectedQuestionBank = questionBanks?.data.find((questionBank) => questionBank.id === form.question_bank_id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      await createJob(companyId, {
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
      toast.success('Job created successfully');
      router.push(`/companies/${companyId}/jobs`);
    } catch {
      toast.error('Failed to create job');
    }
  };

  return (
    <div>
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="-ml-2 text-muted-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Jobs
        </Button>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Create New Job</h1>
        <p className="mt-2 text-muted-foreground">Draft a new position and start accepting applications.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-border/40">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10">
                <Briefcase className="h-4.5 w-4.5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-base">Job Details</CardTitle>
                <CardDescription className="text-xs">Basic information about the position</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">Job Title *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => {
                  setForm({ ...form, title: e.target.value });
                  setErrors((current) => ({ ...current, title: undefined }));
                }}
                placeholder="e.g. Senior Frontend Engineer"
                required
                className="h-12 rounded-lg bg-muted/50 border-border/60"
              />
              {errors.title ? <p className="text-xs text-destructive">{errors.title}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">Description *</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => {
                  setForm({ ...form, description: e.target.value });
                  setErrors((current) => ({ ...current, description: undefined }));
                }}
                placeholder="Describe the role, responsibilities, and team..."
                rows={6}
                required
                className="rounded-lg bg-muted/50 border-border/60"
              />
              {errors.description ? <p className="text-xs text-destructive">{errors.description}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements" className="text-sm font-medium">Requirements</Label>
              <Textarea
                id="requirements"
                value={form.requirements}
                onChange={(e) => setForm({ ...form, requirements: e.target.value })}
                placeholder="List skills, experience, and qualifications..."
                rows={4}
                className="rounded-lg bg-muted/50 border-border/60"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
                <MapPin className="h-4.5 w-4.5 text-emerald-600" />
              </div>
              <div>
                <CardTitle className="text-base">Location & Compensation</CardTitle>
                <CardDescription className="text-xs">Where and how much</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-medium">Location</Label>
                <Input
                  id="location"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="e.g. San Francisco, CA or Remote"
                  className="h-12 rounded-lg bg-muted/50 border-border/60"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salary_range" className="text-sm font-medium">Salary Range</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="salary_range"
                    value={form.salary_range}
                    onChange={(e) => setForm({ ...form, salary_range: e.target.value })}
                    placeholder="e.g. $120k - $150k"
                    className="h-12 pl-10 rounded-lg bg-muted/50 border-border/60"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="employment_type" className="text-sm font-medium">Employment Type</Label>
                <Select
                  value={form.employment_type}
                  onValueChange={(val) => setForm({ ...form, employment_type: val ?? form.employment_type })}
                >
                  <SelectTrigger id="employment_type" className="h-12 rounded-lg bg-muted/50 border-border/60">
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
                <Label htmlFor="deadline" className="text-sm font-medium">Application Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={form.application_deadline}
                  min={minDeadlineDate}
                  onChange={(e) => {
                    setForm({ ...form, application_deadline: e.target.value });
                    setErrors((current) => ({ ...current, application_deadline: undefined }));
                  }}
                  className="h-12 rounded-lg bg-muted/50 border-border/60"
                />
                {errors.application_deadline ? <p className="text-xs text-destructive">{errors.application_deadline}</p> : null}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10">
                <Settings2 className="h-4.5 w-4.5 text-indigo-600" />
              </div>
              <div>
                <CardTitle className="text-base">Application Settings</CardTitle>
                <CardDescription className="text-xs">Configure visibility and application mode</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="visibility" className="text-sm font-medium">Visibility</Label>
                <Select
                  value={form.visibility}
                  onValueChange={(val) => {
                    if (!val) return;
                    setForm({ ...form, visibility: val as JobVisibility });
                  }}
                >
                  <SelectTrigger id="visibility" className="h-12 rounded-lg bg-muted/50 border-border/60">
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
                <Label htmlFor="status" className="text-sm font-medium">Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(val) => {
                    if (!val) return;
                    setForm({ ...form, status: val as JobStatus });
                    setErrors((current) => ({ ...current, status: undefined }));
                  }}
                >
                  <SelectTrigger id="status" className="h-12 rounded-lg bg-muted/50 border-border/60">
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
                <Label htmlFor="application_mode" className="text-sm font-medium">Application Mode</Label>
                <Select
                  value={form.application_mode}
                  onValueChange={(val) => {
                    if (!val) return;
                    const nextMode = val as ApplicationMode;
                    setForm({
                      ...form,
                      application_mode: nextMode,
                      question_bank_id: nextMode === ApplicationMode.QUESTIONNAIRE ? form.question_bank_id : '',
                    });
                    setErrors((current) => ({
                      ...current,
                      application_mode: undefined,
                      question_bank_id: nextMode === ApplicationMode.QUESTIONNAIRE ? current.question_bank_id : undefined,
                    }));
                  }}
                >
                  <SelectTrigger id="application_mode" className="h-12 rounded-lg bg-muted/50 border-border/60">
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
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                    <HelpCircle className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Question Bank Selector</p>
                    <p className="text-xs text-muted-foreground">Questions will be snapshot-copied from the selected bank.</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="question_bank_id" className="text-sm font-medium">Question Bank</Label>
                  <Select
                    value={form.question_bank_id}
                    onValueChange={(value) => {
                      setForm({ ...form, question_bank_id: value ?? '' });
                      setErrors((current) => ({ ...current, question_bank_id: undefined }));
                    }}
                  >
                    <SelectTrigger id="question_bank_id" className="h-12 rounded-lg bg-background border-border/60">
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
                  <div className="mt-4 space-y-3">
                    <div className="rounded-xl border border-amber-300/50 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
                      âš ï¸ Questions are copied at job creation time. Editing this question bank later will NOT affect this job.
                    </div>
                    <div className="rounded-xl border border-border/40 bg-background p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold">{selectedQuestionBank.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {selectedQuestionBank.questions_json.length} question{selectedQuestionBank.questions_json.length === 1 ? '' : 's'} will be attached to this job.
                          </p>
                        </div>
                        <Badge className="badge-invited">Screening</Badge>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 rounded-xl border border-dashed border-border/60 px-4 py-3 text-sm text-muted-foreground">
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
        </Card>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading} className="border-border/60">
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="btn-gradient px-8"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Job
          </Button>
        </div>
      </form>
    </div>
  );
}


