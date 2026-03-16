'use client';

import { use, useMemo } from 'react';
import Image from 'next/image';
import { useCompany } from '@/lib/hooks/useCompany';
import { useCompanyJobs } from '@/lib/hooks/useJobs';
import { useCompanyApplications } from '@/lib/hooks/useApplications';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Building2, Users, Briefcase, FileText, Plus, ArrowRight, Clock, TrendingUp, RefreshCcw } from 'lucide-react';
import Link from 'next/link';
import ApplicationStatusBadge from '@/components/applications/ApplicationStatusBadge';
import { JobStatus, ApplicationStatus } from '@/types';

export default function CompanyDashboardPage({ params }: { params: Promise<{ companyId: string }> }) {
  const { companyId } = use(params);
  const { data: company, loading: loadingCompany } = useCompany(companyId);
  const jobsParams = useMemo(() => ({ page: 1, limit: 100 }), []);
  const appsParams = useMemo(() => ({ page: 1, limit: 5 }), []);
  const { data: jobs, loading: loadingJobs, refetch: refetchJobs } = useCompanyJobs(companyId, jobsParams);
  const { data: applications, loading: loadingApps, refetch: refetchApps } = useCompanyApplications(companyId, appsParams);

  const handleRefresh = () => {
    refetchJobs();
    refetchApps();
  };

  if (loadingCompany) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-4">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!company) {
    return <div>Company not found</div>;
  }

  const totalJobs = jobs?.meta.total || 0;
  const activeJobs = jobs?.data.filter((j) => j.status === JobStatus.ACTIVE).length || 0;
  const totalApps = applications?.meta.total || 0;
  const pendingApps = applications?.data.filter((a) => a.status === ApplicationStatus.APPLIED).length || 0;

  const metrics = [
    {
      title: 'Total Jobs',
      value: loadingJobs ? '-' : totalJobs,
      subtitle: `${activeJobs} active`,
      icon: Briefcase,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      gradient: 'from-blue-500/5 to-blue-500/0',
    },
    {
      title: 'Active Jobs',
      value: loadingJobs ? '-' : activeJobs,
      subtitle: 'Accepting applications',
      icon: TrendingUp,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      gradient: 'from-emerald-500/5 to-emerald-500/0',
    },
    {
      title: 'Total Applications',
      value: loadingApps ? '-' : totalApps,
      subtitle: 'All time',
      icon: FileText,
      color: 'text-indigo-500',
      bg: 'bg-indigo-500/10',
      gradient: 'from-indigo-500/5 to-indigo-500/0',
    },
    {
      title: 'Pending Review',
      value: loadingApps ? '-' : pendingApps,
      subtitle: pendingApps > 0 ? 'Action needed' : 'All clear',
      icon: Clock,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      gradient: 'from-amber-500/5 to-amber-500/0',
    },
  ];

  return (
    <div>
      {/* Company Header */}
      <div className="mb-8 flex items-center gap-4">
        {company.logo_url ? (
          <Image
            src={company.logo_url}
            alt={`${company.name} logo`}
            width={64}
            height={64}
            unoptimized
            className="h-16 w-16 rounded-xl object-cover border border-border/40 shadow-sm"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-linear-to-br from-blue-500/20 to-indigo-500/20 shadow-inner">
            <Building2 className="h-8 w-8 text-blue-500" />
          </div>
        )}
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{company.name}</h1>
          {company.website && (
            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-500 hover:text-blue-400 transition-colors"
            >
              {company.website}
            </a>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={loadingJobs || loadingApps}
          className="ml-auto shrink-0"
        >
          <RefreshCcw className={`h-4 w-4 mr-2 ${loadingJobs || loadingApps ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {metrics.map((metric) => (
          <Card key={metric.title} className={`border-border/40 overflow-hidden relative card-hover`}>
            <div className={`absolute inset-0 bg-linear-to-br ${metric.gradient} pointer-events-none`} />
            <CardContent className="p-5 relative">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-muted-foreground">{metric.title}</span>
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${metric.bg}`}>
                  <metric.icon className={`h-4.5 w-4.5 ${metric.color}`} />
                </div>
              </div>
              <div className="text-3xl font-bold tracking-tight">{metric.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{metric.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Two Column: Activity + Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <Card className="lg:col-span-2 border-border/40">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Recent Applications</CardTitle>
            <Link href={`/companies/${companyId}/applications`}>
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary-hover text-xs">
                View All <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {loadingApps ? (
              <div className="space-y-0">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-6 py-4 border-t border-border/40">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3.5 w-40" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                ))}
              </div>
            ) : applications && applications.data.length > 0 ? (
              <div className="divide-y divide-border/40">
                {applications.data.map((app) => (
                  <div key={app.id} className="flex items-center gap-3 px-6 py-3.5 hover:bg-accent/30 transition-colors">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-light text-primary text-xs font-bold shrink-0">
                      {(app.candidate_email || 'U')[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{app.candidate_email}</p>
                      <p className="text-xs text-muted-foreground truncate">{app.job_title || 'Unknown Job'}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <ApplicationStatusBadge status={app.status} />
                      <span className="text-xs text-muted-foreground hidden sm:block">
                        {new Date(app.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 py-12 text-center text-sm text-muted-foreground">
                No applications yet. Publish a job to start receiving applications.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-border/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href={`/companies/${companyId}/jobs/new`} className="block">
              <Button className="w-full btn-gradient justify-start">
                <Plus className="mr-2 h-4 w-4" />
                Post New Job
              </Button>
            </Link>
            <Link href={`/companies/${companyId}/applications`} className="block">
              <Button variant="outline" className="w-full justify-start border-border/60">
                <FileText className="mr-2 h-4 w-4" />
                View Applications
              </Button>
            </Link>
            <Link href={`/companies/${companyId}/members`} className="block">
              <Button variant="outline" className="w-full justify-start border-border/60">
                <Users className="mr-2 h-4 w-4" />
                Invite Team Member
              </Button>
            </Link>
          </CardContent>

          {/* About */}
          <div className="border-t border-border/40 p-6 mt-2">
            <h4 className="text-sm font-medium mb-2">About</h4>
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-4">
              {company.description || 'No description provided.'}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}


