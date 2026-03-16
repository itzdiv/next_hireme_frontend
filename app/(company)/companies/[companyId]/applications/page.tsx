'use client';

import { use, useState, useMemo } from 'react';
import { useCompanyApplications } from '@/lib/hooks/useApplications';
import ApplicationStatusBadge from '@/components/applications/ApplicationStatusBadge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Pagination from '@/components/shared/Pagination';
import EmptyState from '@/components/shared/EmptyState';
import { ArrowRight, Eye, Users } from 'lucide-react';
import { CompanyApplicationDetail } from '@/types';
import { ApplicationReviewModal } from './_components/ApplicationReviewModal';

export default function CompanyApplicationsPage({ params }: { params: Promise<{ companyId: string }> }) {
  const { companyId } = use(params);
  const [page, setPage] = useState(1);
  const queryParams = useMemo(() => ({ page, limit: 12 }), [page]);
  const { data, loading, error, refetch } = useCompanyApplications(companyId, queryParams);
  
  const [selectedApp, setSelectedApp] = useState<CompanyApplicationDetail | null>(null);

  const handleCloseDetail = () => {
    setSelectedApp(null);
    refetch();
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Applications Dashboard</h1>
          <p className="mt-2 text-muted-foreground">Review and manage your candidate pipeline.</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl skeleton-shimmer" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
          <p className="text-sm font-medium text-destructive">Something went wrong loading this page. Please try again.</p>
          <Button variant="outline" className="mt-4" onClick={refetch}>
            Retry
          </Button>
        </div>
      ) : data && data.data.length > 0 ? (
        <>
          <div className="rounded-xl border border-border/40 bg-card">
            <div className="overflow-x-auto">
            <table className="w-full min-w-155 text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] md:text-xs tracking-wider">
                <tr>
                  <th className="px-4 md:px-6 py-3 md:py-4 font-medium">Candidate</th>
                  <th className="px-4 md:px-6 py-3 md:py-4 font-medium hidden sm:table-cell">Applied Role</th>
                  <th className="px-4 md:px-6 py-3 md:py-4 font-medium hidden md:table-cell">Date</th>
                  <th className="px-4 md:px-6 py-3 md:py-4 font-medium">Status</th>
                  <th className="px-4 md:px-6 py-3 md:py-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {data.data.map((app) => (
                  <tr key={app.id} className="hover:bg-accent/30 transition-colors cursor-pointer" onClick={() => setSelectedApp(app)}>
                    <td className="px-4 md:px-6 py-3 md:py-4">
                      <div className="flex items-center gap-3">
                        <div className="hidden sm:flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 text-xs font-bold shrink-0">
                          {(app.candidate_email || 'U')[0].toUpperCase()}
                        </div>
                        <span className="font-semibold truncate max-w-37.5 sm:max-w-50">{app.candidate_email || 'Unknown Candidate'}</span>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4 text-muted-foreground hidden sm:table-cell truncate max-w-37.5">
                      {app.job_title || 'Unknown Job'}
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4 text-muted-foreground hidden md:table-cell">
                      {new Date(app.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4">
                      <ApplicationStatusBadge status={app.status} />
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4 text-right">
                      <Button variant="ghost" size="sm" className="hidden sm:inline-flex" onClick={(e) => { e.stopPropagation(); setSelectedApp(app); }}>
                        Review
                        <ArrowRight className="ml-1 h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="sm:hidden h-11 w-11" onClick={(e) => { e.stopPropagation(); setSelectedApp(app); }}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
          <div className="mt-4">
            {data.meta && <Pagination meta={data.meta} onPageChange={setPage} />}
          </div>
        </>
      ) : (
        <EmptyState
          icon={Users}
          title="No applications received yet"
          description="No applications received yet."
        />
      )}

      <ApplicationReviewModal
        companyId={companyId}
        application={selectedApp}
        isOpen={selectedApp !== null}
        onClose={handleCloseDetail}
        onRefresh={refetch}
      />
    </div>
  );
}


