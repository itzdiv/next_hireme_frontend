'use client';

import { use, useState, useMemo } from 'react';
import { useMembers, useInviteMember, useMyCompanies, useUpdateMemberRole, useRevokeMember } from '@/lib/hooks/useCompany';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import Pagination from '@/components/shared/Pagination';
import EmptyState from '@/components/shared/EmptyState';
import ConfirmModal from '@/components/shared/ConfirmModal';
import { toast } from 'sonner';
import { Users, Plus, Shield, UserX, Loader2, Mail } from 'lucide-react';
import { MemberRole, MemberStatus } from '@/types';

function RoleBadge({ role }: { role: MemberRole }) {
  switch (role) {
    case MemberRole.OWNER:
      return <Badge className="badge-owner"><Shield className="mr-1 h-3 w-3" /> Owner</Badge>;
    case MemberRole.ADMIN:
      return <Badge className="badge-admin">Admin</Badge>;
    case MemberRole.RECRUITER:
      return <Badge className="badge-recruiter">Recruiter</Badge>;
    default:
      return <Badge variant="outline">{role}</Badge>;
  }
}

function getMemberStatusBadgeClass(status: MemberStatus): string {
  if (status === MemberStatus.INVITED) return 'badge-invited';
  if (status === MemberStatus.REVOKED) return 'badge-revoked';
  return 'opacity-0';
}

export default function CompanyMembersPage({ params }: { params: Promise<{ companyId: string }> }) {
  const { companyId } = use(params);
  const [page, setPage] = useState(1);
  const queryParams = useMemo(() => ({ page, limit: 12 }), [page]);

  const { data, loading, error, refetch } = useMembers(companyId, queryParams);
  const { data: myCompanies } = useMyCompanies();
  const { mutate: invite, loading: inviting } = useInviteMember();
  const { mutate: updateRole } = useUpdateMemberRole();
  const { mutate: revokeMember, loading: revoking } = useRevokeMember();

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: '', role: MemberRole.RECRUITER });
  const [inviteErrors, setInviteErrors] = useState<Partial<Record<'email' | 'role', string>>>({});
  const [revokeTarget, setRevokeTarget] = useState<string | null>(null);

  const currentMembership = myCompanies.find((membership) => membership.company_id === companyId);
  const canManageTeam = currentMembership?.role === MemberRole.OWNER || currentMembership?.role === MemberRole.ADMIN;

  const validateInviteForm = () => {
    const nextErrors: Partial<Record<'email' | 'role', string>> = {};
    const email = inviteForm.email.trim();

    if (!email) {
      nextErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = 'Please enter a valid email address';
    }

    if (![MemberRole.ADMIN, MemberRole.RECRUITER].includes(inviteForm.role)) {
      nextErrors.role = 'Role must be Admin or Recruiter';
    }

    setInviteErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInviteForm()) return;
    try {
      await invite(companyId, inviteForm);
      toast.success('Invitation sent successfully');
      setInviteOpen(false);
      setInviteForm({ email: '', role: MemberRole.RECRUITER });
      setInviteErrors({});
      refetch();
    } catch {
      toast.error('Failed to send invitation');
    }
  };

  const handleRoleChange = async (memberUserId: string, newRole: MemberRole) => {
    try {
      await updateRole(companyId, memberUserId, { role: newRole });
      toast.success('Role updated successfully');
      refetch();
    } catch {
      toast.error('Failed to update role');
    }
  };

  const handleRevoke = async () => {
    if (!revokeTarget) return;
    try {
      await revokeMember(companyId, revokeTarget);
      toast.success('Access revoked');
      setRevokeTarget(null);
      refetch();
    } catch {
      toast.error('Failed to revoke access');
    }
  };

  const renderMembersGrid = () => {
    if (loading) {
      return Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-40 rounded-xl skeleton-shimmer" />
      ));
    }

    if (error || !data || data.data.length === 0) {
      return (
        <div className="col-span-full">
          <EmptyState
            icon={Users}
            title="No members found"
            description="Invite colleagues to collaborate on hiring."
          />
        </div>
      );
    }

    return data.data.map((member) => (
      <Card key={member.id} className="border-border/40 card-hover flex flex-col relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4">
          <Badge variant="outline" className={`font-normal ${getMemberStatusBadgeClass(member.status)}`}>
            {member.status === MemberStatus.INVITED ? 'Pending' : member.status}
          </Badge>
        </div>
        <CardContent className="p-5 flex-1 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-light shrink-0 border border-primary-border/60">
              <span className="text-primary font-bold text-lg">
                {member.email[0].toUpperCase()}
              </span>
            </div>
            <div className="min-w-0 pr-12">
               <p className="font-semibold truncate" title={member.email}>{member.email}</p>
               <p className="text-xs text-muted-foreground mt-0.5"><RoleBadge role={member.role} /></p>
            </div>
          </div>

          <div className="mt-auto pt-4 border-t border-border/40 flex items-center gap-2">
            <Select
              defaultValue={member.role}
              onValueChange={(val) => handleRoleChange(member.user_id, val as MemberRole)}
              disabled={member.role === MemberRole.OWNER || member.status === MemberStatus.REVOKED}
            >
              <SelectTrigger className="h-9 flex-1 bg-muted/30 border-border/60 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={MemberRole.OWNER} disabled>Owner</SelectItem>
                <SelectItem value={MemberRole.ADMIN}>Admin</SelectItem>
                <SelectItem value={MemberRole.RECRUITER}>Recruiter</SelectItem>
              </SelectContent>
            </Select>

            {member.role !== MemberRole.OWNER && member.status !== MemberStatus.REVOKED && (
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-red-500 hover:bg-red-50 h-9 w-9 shrink-0"
                onClick={() => setRevokeTarget(member.user_id)}
                title="Revoke Access"
              >
                <UserX className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    ));
  };

  if (!canManageTeam) {
    return (
      <div className="rounded-xl border border-border/40 bg-card p-6">
        <h1 className="text-xl font-semibold">Team access restricted</h1>
        <p className="mt-2 text-sm text-muted-foreground">Only OWNER and ADMIN members can manage team members.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Members</h1>
          <p className="mt-2 text-muted-foreground">Manage who has access to your company dashboard.</p>
        </div>
        <Button onClick={() => setInviteOpen(true)} className="btn-gradient">
          <Plus className="mr-2 h-4 w-4" />
          Invite Member
        </Button>
      </div>

      {error ? (
        <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/5 p-6">
          <p className="text-sm font-medium text-destructive">Something went wrong loading this page. Please try again.</p>
          <Button variant="outline" className="mt-4" onClick={refetch}>
            Retry
          </Button>
        </div>
      ) : null}

      {!loading && !error && data && data.data.length === 1 && data.data[0].role === MemberRole.OWNER ? (
        <div className="mb-6 rounded-xl border border-border/40 bg-card p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-muted-foreground">Invite your first team member</p>
          <Button size="sm" onClick={() => setInviteOpen(true)} className="btn-gradient">
            <Plus className="mr-2 h-4 w-4" />
            Invite your first team member
          </Button>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {renderMembersGrid()}
      </div>

      <div className="mt-6">
        {data?.meta && <Pagination meta={data.meta} onPageChange={setPage} />}
      </div>

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-light mb-4">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Send an email invitation allowing a colleague to join your dashboard.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleInvite} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-medium">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="colleague@company.com"
                value={inviteForm.email}
                onChange={(e) => {
                  setInviteForm({ ...inviteForm, email: e.target.value });
                  setInviteErrors((current) => ({ ...current, email: undefined }));
                }}
                required
                className="h-11 bg-muted/50 border-border/60"
              />
              {inviteErrors.email ? <p className="text-xs text-destructive">{inviteErrors.email}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="role" className="font-medium">Role</Label>
              <Select
                value={inviteForm.role}
                onValueChange={(val) => {
                  setInviteForm({ ...inviteForm, role: val as MemberRole });
                  setInviteErrors((current) => ({ ...current, role: undefined }));
                }}
              >
                <SelectTrigger id="role" className="h-11 bg-muted/50 border-border/60">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={MemberRole.ADMIN}>Admin (Full Access)</SelectItem>
                  <SelectItem value={MemberRole.RECRUITER}>Recruiter (Manage Jobs & Candidates)</SelectItem>
                </SelectContent>
              </Select>
              {inviteErrors.role ? <p className="text-xs text-destructive">{inviteErrors.role}</p> : null}
            </div>
            <DialogFooter className="pt-4 border-t border-border/40 mt-4">
              <Button type="button" variant="outline" onClick={() => setInviteOpen(false)} disabled={inviting}>
                Cancel
              </Button>
              <Button type="submit" disabled={inviting} className="btn-gradient">
                {inviting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Invite
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmModal
        open={!!revokeTarget}
        onOpenChange={(open) => !open && setRevokeTarget(null)}
        title="Revoke Access"
        description="Are you sure you want to revoke this user's access? They will no longer be able to view or manage jobs and applications for this company."
        confirmLabel="Revoke"
        variant="destructive"
        loading={revoking}
        onConfirm={handleRevoke}
      />
    </div>
  );
}


