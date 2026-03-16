'use client';

import { use, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCompanyJobs, useUpdateJobStatus, useDeleteJob } from '@/lib/hooks/useJobs';
import { useMyCompanies } from '@/lib/hooks/useCompany';
import JobStatusBadge from '@/components/jobs/JobStatusBadge';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import EmptyState from '@/components/shared/EmptyState';
import ConfirmModal from '@/components/shared/ConfirmModal';
import Pagination from '@/components/shared/Pagination';
import { toast } from 'sonner';
import { Briefcase, Plus, MoreVertical, Edit2, Play, Pause, Trash2, MapPin, Calendar, Eye, Globe2, Lock, Loader2 } from 'lucide-react';
import { JobStatus, JobVisibility, MemberRole } from '@/types';

const STATUS_FILTER_ALL = 'ALL';
type StatusFilter = JobStatus | typeof STATUS_FILTER_ALL;
const STATUS_FILTERS: StatusFilter[] = [STATUS_FILTER_ALL, JobStatus.DRAFT, JobStatus.ACTIVE, JobStatus.CLOSED];

function getStatusFilterLabel(status: StatusFilter): string {
  if (status === STATUS_FILTER_ALL) return 'All';
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export default function CompanyJobsPage({ params }: { params: Promise<{ companyId: string }> }) {
  const { companyId } = use(params);
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(STATUS_FILTER_ALL);
  const queryParams = useMemo(() => ({ page, limit: 10 }), [page]);

  const { data, loading, error, refetch } = useCompanyJobs(companyId, queryParams);
  const { data: myCompanies } = useMyCompanies();
  const { mutate: updateStatus, loading: updatingStatus } = useUpdateJobStatus();
  const { mutate: deleteJob, loading: deleting } = useDeleteJob();

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const filteredJobs = data?.data.filter(
    (job) => statusFilter === STATUS_FILTER_ALL || job.status === statusFilter
  );

  const currentMembership = myCompanies.find((membership) => membership.company_id === companyId);
  const canManageStatus =
    currentMembership?.status === 'ACTIVE'
    && [MemberRole.OWNER, MemberRole.ADMIN, MemberRole.RECRUITER].includes(currentMembership.role);

  const getPrimaryStatusAction = (status: JobStatus) => {
    if (status === JobStatus.DRAFT) return { label: 'Publish', next: JobStatus.ACTIVE, icon: Play };
    if (status === JobStatus.ACTIVE) return { label: 'Close Hiring', next: JobStatus.CLOSED, icon: Pause };
    return { label: 'Reopen', next: JobStatus.ACTIVE, icon: Play };
  };

  const handleStatusToggle = async (jobId: string, newStatus: JobStatus) => {
    try {
      await updateStatus(companyId, jobId, { status: newStatus });
      toast.success(`Job marked as ${newStatus}`);
      refetch();
    } catch {
      toast.error('Failed to update job status');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteJob(companyId, deleteTarget);
      toast.success('Job deleted successfully');
      setDeleteTarget(null);
      refetch();
    } catch {
      toast.error('Failed to delete job. You can only delete Drafts or Closed jobs with no applications.');
    }
  };

  const renderJobsContent = () => {
    if (loading) {
      return (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl skeleton-shimmer" />
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
          <p className="text-sm font-medium text-destructive">Something went wrong loading this page. Please try again.</p>
          <Button variant="outline" className="mt-4" onClick={refetch}>
            Retry
          </Button>
        </div>
      );
    }

    if (!filteredJobs || filteredJobs.length === 0) {
      return (
        <EmptyState
          icon={Briefcase}
          title="No jobs posted yet"
          description="No jobs posted yet. Click 'Post New Job' to create your first listing."
          actionLabel="Post New Job"
          onAction={() => router.push(`/companies/${companyId}/jobs/new`)}
        />
      );
    }

    return (
      <>
        <div className="rounded-xl border border-border/40 bg-card">
          <div className="max-h-[65vh] overflow-x-auto overflow-y-auto">
          <table className="w-full min-w-160 text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">Job Title</th>
                <th className="px-6 py-4 font-medium hidden md:table-cell">Location</th>
                <th className="px-6 py-4 font-medium hidden sm:table-cell">Created</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium hidden lg:table-cell">Visibility</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredJobs.map((job) => {
                const primaryAction = getPrimaryStatusAction(job.status);
                const PrimaryIcon = primaryAction.icon;

                return (
                  <tr key={job.id} className="hover:bg-accent/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold whitespace-normal wrap-break-word max-w-50 lg:max-w-xs">{job.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 md:hidden">
                        {job.location || 'Remote'}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground hidden md:table-cell">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" />
                        {job.location || 'Remote'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground hidden sm:table-cell">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(job.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <JobStatusBadge status={job.status} />
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
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
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/companies/${companyId}/jobs/${job.id}`}>
                          <Button variant="ghost" size="icon" className="h-11 w-11">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          className="hidden md:inline-flex"
                          disabled={!canManageStatus || updatingStatus}
                          onClick={() => handleStatusToggle(job.id, primaryAction.next)}
                        >
                          {updatingStatus ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <PrimaryIcon className="mr-1.5 h-3.5 w-3.5" />}
                          {primaryAction.label}
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger className="inline-flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50">
                            <MoreVertical className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-52 border-border/40">
                            <DropdownMenuItem onClick={() => router.push(`/companies/${companyId}/jobs/${job.id}`)}>
                              <Edit2 className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              disabled={!canManageStatus || updatingStatus}
                              onClick={() => handleStatusToggle(job.id, primaryAction.next)}
                            >
                              <PrimaryIcon className="mr-2 h-4 w-4" /> {primaryAction.label}
                            </DropdownMenuItem>
                            <DropdownMenuItem disabled={!canManageStatus || updatingStatus} onClick={() => handleStatusToggle(job.id, JobStatus.DRAFT)}>
                              Set Draft
                            </DropdownMenuItem>
                            <DropdownMenuItem disabled={!canManageStatus || updatingStatus} onClick={() => handleStatusToggle(job.id, JobStatus.ACTIVE)}>
                              Set Active
                            </DropdownMenuItem>
                            <DropdownMenuItem disabled={!canManageStatus || updatingStatus} onClick={() => handleStatusToggle(job.id, JobStatus.CLOSED)}>
                              Set Closed
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setDeleteTarget(job.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>
        {data?.meta && <Pagination meta={data.meta} onPageChange={setPage} />}
      </>
    );
  };

  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Job Listings</h1>
          <p className="mt-2 text-muted-foreground">Manage your open roles and drafts.</p>
        </div>
        <Link href={`/companies/${companyId}/jobs/new`}>
          <Button className="btn-gradient">
            <Plus className="mr-2 h-4 w-4" />
            Post New Job
          </Button>
        </Link>
      </div>

      {/* Status filter tabs */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {STATUS_FILTERS.map((status) => (
          <Badge
            key={status}
            variant={statusFilter === status ? 'default' : 'outline'}
            className={`cursor-pointer transition-all text-xs py-1.5 px-3 ${
              statusFilter === status
                ? 'bg-primary text-white hover:bg-primary-hover border-transparent'
                : 'hover:bg-accent border-border/60'
            }`}
            onClick={() => setStatusFilter(status)}
          >
            {getStatusFilterLabel(status)}
          </Badge>
        ))}
      </div>

      {renderJobsContent()}

      <ConfirmModal
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Job"
        description="Are you sure you want to delete this job listing? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}

