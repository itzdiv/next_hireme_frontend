import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Briefcase, DollarSign, ArrowUpRight } from 'lucide-react';
import { CompanyAvatar } from '@/components/jobs/CompanyAvatar';
import type { JobListing } from '@/types';

function formatDeadline(deadline: string | null): string | null {
  if (!deadline) return null;
  const d = new Date(deadline);
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days < 0) return 'Expired';
  if (days === 0) return 'Last day';
  if (days === 1) return '1 day left';
  return `${days} days left`;
}

interface JobCardProps {
  job: JobListing;
  hasApplied?: boolean;
  isAuthenticated?: boolean;
}

export default function JobCard({ job, hasApplied = false, isAuthenticated: _isAuthenticated = false }: JobCardProps) {
  const deadlineText = formatDeadline(job.application_deadline);

  return (
    <Card className="group border-border/40 bg-card transition-all duration-300 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5 hover:-translate-y-0.5 h-full">
      <CardContent className="p-6 flex flex-col h-full">
          {/* Top row */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <CompanyAvatar companyName={job.company_name ?? ''} logoUrl={job.company_logo_url} size="sm" />
            <Link href={`/jobs/${job.id}`} className="shrink-0">
              <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </div>

          {/* Company name */}
          {job.company_name && (
            <span className="text-xs font-medium text-blue-600 mb-1 uppercase tracking-wider">
              {job.company_name}
            </span>
          )}

          {/* Title */}
          <Link href={`/jobs/${job.id}`} className="group/title">
            <h3 className="text-lg font-semibold transition-colors line-clamp-1 group-hover/title:text-blue-600">
              {job.title}
            </h3>
          </Link>

          {/* Description */}
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2 flex-1">
            {job.description}
          </p>

          {/* Tags */}
          <div className="mt-4 flex flex-wrap items-center gap-2 pt-4 border-t border-border/40">
            {job.location && (
              <Badge variant="secondary" className="text-xs font-normal gap-1">
                <MapPin className="h-3 w-3" />
                {job.location}
              </Badge>
            )}
            {job.employment_type && (
              <Badge variant="secondary" className="text-xs font-normal gap-1">
                <Briefcase className="h-3 w-3" />
                {job.employment_type.replace('_', ' ')}
              </Badge>
            )}
            {job.salary_range && (
              <Badge variant="secondary" className="text-xs font-normal gap-1">
                <DollarSign className="h-3 w-3" />
                {job.salary_range}
              </Badge>
            )}
            {deadlineText && (
              <Badge
                variant="outline"
                className={`text-xs font-normal gap-1 ${
                  deadlineText === 'Expired' ? 'text-red-500 border-red-200' : ''
                }`}
              >
                <Clock className="h-3 w-3" />
                {deadlineText}
              </Badge>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 pt-4 border-t border-border/40">
            <Link href={`/jobs/${job.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-700">
              View Details
            </Link>
            {hasApplied ? (
              <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#EFF6FF] text-[#1E40AF] border border-[#BFDBFE] flex items-center gap-1">
                Applied
              </span>
            ) : (
              <Link
                href={`/jobs/${job.id}`}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#2563EB] text-white hover:bg-[#1D4ED8] transition-colors"
              >
                View Job →
              </Link>
            )}
          </div>
      </CardContent>
    </Card>
  );
}


