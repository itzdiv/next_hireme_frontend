'use client';

import { useState, useMemo, useEffect } from 'react';
import { applicationsApi } from '@/lib/api/applications';
import { usePublicJobs } from '@/lib/hooks/useJobs';
import { useAuthStore } from '@/lib/store';
import JobCard from '@/components/jobs/JobCard';
import Pagination from '@/components/shared/Pagination';
import EmptyState from '@/components/shared/EmptyState';
import Navbar from '@/components/shared/Navbar';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Briefcase, MapPin, SlidersHorizontal } from 'lucide-react';

export default function JobsPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('All Locations');
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());
  const params = useMemo(() => ({ page, limit: 12 }), [page]);
  const { data, loading, error, refetch } = usePublicJobs(params);

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated) {
      const resetId = window.setTimeout(() => {
        setAppliedJobIds(new Set());
      }, 0);
      return () => window.clearTimeout(resetId);
    }

    let isMounted = true;

    async function loadAppliedJobs() {
      try {
        const response = await applicationsApi.listCandidateApplications({ page: 1, limit: 200 });
        const ids = new Set(
          response.data
            .map((application) => application.job_id || application.job.id)
            .filter(Boolean),
        );
        if (isMounted) {
          setAppliedJobIds(ids);
        }
      } catch {
        if (isMounted) {
          setAppliedJobIds(new Set());
        }
      }
    }

    loadAppliedJobs();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, isHydrated]);

  const locationFilters = useMemo(() => {
    const uniqueLocations = Array.from(
      new Set((data?.data ?? []).map((job) => job.location).filter((location): location is string => !!location))
    );

    return ['All Locations', ...uniqueLocations];
  }, [data?.data]);

  const filteredJobs = data?.data.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      (job.company_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (job.location || '').toLowerCase().includes(search.toLowerCase());
    const matchesLocation =
      locationFilter === 'All Locations' ||
      (job.location || '').toLowerCase().includes(locationFilter.toLowerCase());
    return matchesSearch && matchesLocation;
  });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex flex-1 flex-col">
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8 page-enter">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Browse Jobs</h1>
          <p className="mt-2 text-muted-foreground">
            Discover open positions from top companies
          </p>
        </div>

        {/* Search + Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative max-w-lg">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, company, or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-12 pl-10 rounded-lg bg-muted/50 border-border/60 text-sm"
            />
          </div>

          {/* Location Filter Chips */}
          <div className="flex items-center gap-2 flex-wrap">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground mr-1" />
            {locationFilters.map((loc) => (
              <Badge
                key={loc}
                variant={locationFilter === loc ? 'default' : 'outline'}
                className={`cursor-pointer transition-all text-xs py-1.5 px-3 ${
                  locationFilter === loc
                    ? '!border-primary !bg-primary !text-white hover:!bg-primary-hover'
                    : 'border border-border text-muted-foreground hover:bg-muted'
                }`}
                onClick={() => setLocationFilter(loc)}
              >
                {loc === 'All Locations' ? loc : (
                  <>
                    <MapPin className="mr-1 h-3 w-3" />
                    {loc}
                  </>
                )}
              </Badge>
            ))}
          </div>
        </div>

        {/* Results Count */}
        {!loading && filteredJobs && (
          <p className="text-sm text-muted-foreground mb-4">
            {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} found
          </p>
        )}

        {/* Job Grid */}
        <div className="flex-1">
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 auto-rows-max">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-52 rounded-xl skeleton-shimmer" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
            <p className="text-sm font-medium text-destructive">Something went wrong loading this page. Please try again.</p>
            <Button type="button" variant="outline" className="mt-4" onClick={refetch}>
              Retry
            </Button>
          </div>
        ) : filteredJobs && filteredJobs.length > 0 ? (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 auto-rows-max">
              {filteredJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  hasApplied={appliedJobIds.has(job.id)}
                  isAuthenticated={isAuthenticated && isHydrated}
                />
              ))}
            </div>
            {data?.meta && (
              <Pagination meta={data.meta} onPageChange={setPage} />
            )}
          </>
        ) : (
          <div className="flex h-full min-h-64 items-center justify-center">
            <EmptyState
              icon={Briefcase}
              title="No jobs found"
              description="No open positions right now. Check back soon."
            />
          </div>
        )}
        </div>
      </div>
      </main>
      <PublicFooter />
    </div>
  );
}

