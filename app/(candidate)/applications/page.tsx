'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { applicationsApi } from '@/lib/api/applications';
import { useProfile } from '@/lib/hooks/useCandidate';
import { useAuthStore } from '@/lib/store';
import { ApplicationStatus, CandidateApplication } from '@/types';
import { Briefcase } from 'lucide-react';
import { CandidateApplicationCard } from './_components/CandidateApplicationCard';

const STATUS_FILTERS: Array<{ label: string; value: ApplicationStatus | null }> = [
  { label: 'All', value: null },
  { label: 'Applied', value: ApplicationStatus.APPLIED },
  { label: 'Accepted', value: ApplicationStatus.ACCEPTED },
  { label: 'Rejected', value: ApplicationStatus.REJECTED },
  { label: 'Withdrawn', value: ApplicationStatus.WITHDRAWN },
];

function ApplicationsPageSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-9 w-22" />
        ))}
      </div>
      {Array.from({ length: 3 }).map((_, index) => (
        <Skeleton key={index} className="h-40 w-full rounded-xl" />
      ))}
    </div>
  );
}

function ApplicationsPageError({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
      <p className="text-sm font-medium text-destructive">{message}</p>
    </div>
  );
}

function EmptyApplicationsState({
  isFiltered,
  onClearFilter,
}: {
  isFiltered: boolean;
  onClearFilter: () => void;
}) {
  if (isFiltered) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-center">
        <p className="text-sm text-muted-foreground">No applications with this status.</p>
        <button
          type="button"
          onClick={onClearFilter}
          className="text-sm text-primary hover:text-primary-hover"
        >
          Show all applications
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <Briefcase className="h-8 w-8 text-muted-foreground" />
      </div>
      <div className="flex flex-col gap-1">
        <p className="font-medium">No applications yet</p>
        <p className="text-sm text-muted-foreground">
          Start applying to jobs to track your progress here.
        </p>
      </div>
      <Link
        href="/jobs"
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
      >
        Browse Open Jobs
      </Link>
    </div>
  );
}

/**
 * Displays and filters the authenticated candidate's submitted applications.
 */
export default function CandidateApplicationsPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const { loading: loadingProfile, notFound } = useProfile();

  const [applications, setApplications] = useState<CandidateApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<ApplicationStatus | null>(null);

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    let cancelled = false;

    async function loadApplications() {
      try {
        setLoading(true);
        setError(null);
        const response = await applicationsApi.listCandidateApplications({ page: 1, limit: 20 });
        if (!cancelled) {
          setApplications(response.data ?? []);
        }
      } catch {
        if (!cancelled) {
          setError('Failed to load applications.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadApplications();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isHydrated, router]);

  useEffect(() => {
    if (!isHydrated || !isAuthenticated) return;
    if (loadingProfile) return;
    if (notFound) {
      router.replace(`/profile?returnTo=${encodeURIComponent('/applications')}`);
    }
  }, [isAuthenticated, isHydrated, loadingProfile, notFound, router]);

  const filteredApplications = useMemo(() => {
    if (!activeFilter) return applications;
    return applications.filter((application) => application.status === activeFilter);
  }, [activeFilter, applications]);

  const handleWithdraw = (applicationId: string) => {
    setApplications((current) =>
      current.map((application) =>
        application.id === applicationId
          ? { ...application, status: ApplicationStatus.WITHDRAWN }
          : application,
      ),
    );
  };

  if (!isHydrated || !isAuthenticated || loadingProfile || notFound || loading) {
    return <ApplicationsPageSkeleton />;
  }

  if (error) {
    return <ApplicationsPageError message={error} />;
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold">My Applications</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track the status of all your job applications.
        </p>
      </div>

      <div className="-mx-1 flex items-center gap-1 overflow-x-auto border-b px-1 pb-1">
        {STATUS_FILTERS.map((filter) => {
          const count = filter.value
            ? applications.filter((application) => application.status === filter.value).length
            : applications.length;

          return (
            <button
              key={filter.label}
              type="button"
              onClick={() => setActiveFilter(filter.value)}
              className={`flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors sm:px-4 ${
                activeFilter === filter.value
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {filter.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-xs font-normal ${
                  activeFilter === filter.value
                    ? 'bg-primary-light text-primary-text'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-1 flex-col">
        {filteredApplications.length === 0 ? (
          <EmptyApplicationsState
            isFiltered={activeFilter !== null}
            onClearFilter={() => setActiveFilter(null)}
          />
        ) : (
          <div className="flex flex-col gap-4">
            {filteredApplications.map((application) => (
              <CandidateApplicationCard
                key={application.id}
                application={application}
                onWithdraw={handleWithdraw}
              />
            ))}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}


