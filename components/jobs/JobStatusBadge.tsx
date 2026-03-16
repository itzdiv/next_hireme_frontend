import { Badge } from '@/components/ui/badge';
import { JobStatus } from '@/types';

const statusConfig = {
  [JobStatus.DRAFT]: { label: 'Draft', className: 'bg-gray-500/10 text-gray-500 border-gray-500/20' },
  [JobStatus.ACTIVE]: { label: 'Active', className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  [JobStatus.CLOSED]: { label: 'Closed', className: 'bg-red-500/10 text-red-600 border-red-500/20' },
};

export default function JobStatusBadge({ status }: { status: JobStatus }) {
  const config = statusConfig[status] || statusConfig[JobStatus.DRAFT];
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
