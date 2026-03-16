import { Badge } from '@/components/ui/badge';
import { ApplicationStatus } from '@/types';

const statusConfig: Record<ApplicationStatus, { label: string; className: string }> = {
  [ApplicationStatus.APPLIED]: { label: 'Applied', className: 'bg-primary-light text-primary-text border-primary-border' },
  [ApplicationStatus.ACCEPTED]: { label: 'Accepted', className: 'bg-[#DBFCE7] text-[#166534] border-[#BBF7D0]' },
  [ApplicationStatus.REJECTED]: { label: 'Rejected', className: 'bg-muted text-muted-foreground border-border' },
  [ApplicationStatus.WITHDRAWN]: { label: 'Withdrawn by candidate', className: 'bg-muted text-muted-foreground border-border' },
};

export default function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  const config = statusConfig[status];
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
