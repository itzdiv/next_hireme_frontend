'use client';

import { use, useMemo, useState } from 'react';
import { useCompany, useMembers, useMyCompanies, useTransferOwnership, useUpdateCompany } from '@/lib/hooks/useCompany';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import ConfirmModal from '@/components/shared/ConfirmModal';
import { toast } from 'sonner';
import { AlertTriangle, Building2, Crown, Globe, Link as LinkIcon, Loader2, Save, ShieldAlert } from 'lucide-react';
import { MemberRole, MemberStatus } from '@/types';

type SettingsDraft = {
  name: string;
  description: string;
  website: string;
  logo_url: string;
};

export default function CompanySettingsPage({ params }: { params: Promise<{ companyId: string }> }) {
  const { companyId } = use(params);
  const membersParams = useMemo(() => ({ page: 1, limit: 100 }), []);
  const { data: company, loading, refetch } = useCompany(companyId);
  const { data: myCompanies } = useMyCompanies();
  const { data: members, loading: loadingMembers, refetch: refetchMembers } = useMembers(companyId, membersParams);
  const { mutate: updateCompany, loading: saving } = useUpdateCompany();
  const { mutate: transferOwnership, loading: transferring } = useTransferOwnership();

  const [draft, setDraft] = useState<SettingsDraft | null>(null);
  const [selectedTransferMemberId, setSelectedTransferMemberId] = useState<string>('');
  const [confirmTransferOpen, setConfirmTransferOpen] = useState(false);

  const form = draft ?? {
    name: company?.name ?? '',
    description: company?.description ?? '',
    website: company?.website ?? '',
    logo_url: company?.logo_url ?? '',
  };

  const ownershipCandidates = useMemo(
    () =>
      (members?.data ?? []).filter(
        (member) => member.status === MemberStatus.ACTIVE && member.role !== MemberRole.OWNER
      ),
    [members]
  );

  const selectedTransferMember = ownershipCandidates.find(
    (member) => member.id === selectedTransferMemberId
  );
  const currentMembership = myCompanies.find((membership) => membership.company_id === companyId);
  const currentRole = currentMembership?.role;
  const canAccessSettings = currentRole === MemberRole.OWNER || currentRole === MemberRole.ADMIN;
  const canTransferOwnership = currentRole === MemberRole.OWNER;

  const handleFieldChange = (field: keyof SettingsDraft, value: string) => {
    setDraft({
      ...form,
      [field]: value,
    });
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      await updateCompany(companyId, {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        website: form.website.trim() || undefined,
        logo_url: form.logo_url.trim() || undefined,
      });
      toast.success('Company profile updated');
      setDraft(null);
      refetch();
    } catch {
      toast.error('Failed to update company profile');
    }
  };

  const handleTransferOwnership = async () => {
    if (!selectedTransferMemberId) return;

    try {
      await transferOwnership(companyId, selectedTransferMemberId);
      toast.success('Ownership transferred successfully');
      setConfirmTransferOpen(false);
      setSelectedTransferMemberId('');
      refetch();
      refetchMembers();
    } catch {
      toast.error('Ownership transfer failed');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-105 rounded-xl" />
        <Skeleton className="h-60 rounded-xl" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg font-semibold">Company not found</p>
        <p className="mt-1 text-sm text-muted-foreground">This company does not exist or you don&apos;t have access.</p>
      </div>
    );
  }

  if (!canAccessSettings) {
    return (
      <div className="rounded-xl border border-border/40 bg-card p-6">
        <h1 className="text-xl font-semibold">Settings access restricted</h1>
        <p className="mt-2 text-sm text-muted-foreground">Only OWNER and ADMIN members can access company settings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Company Settings</h1>
        <p className="mt-2 text-muted-foreground">
          Update your company profile and manage high-impact administrative actions.
        </p>
      </div>

      <form onSubmit={handleSave}>
        <Card className="border-border/40">
          <CardHeader>
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Profile Editor</CardTitle>
                <CardDescription>
                  Keep your public company identity aligned across the dashboard and job listings.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Company Name</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(event) => handleFieldChange('name', event.target.value)}
                    placeholder="Acme Inc."
                    required
                    minLength={2}
                    className="h-12 bg-muted/40"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={form.description}
                    onChange={(event) => handleFieldChange('description', event.target.value)}
                    placeholder="Describe your company, culture, and hiring focus..."
                    rows={6}
                    className="bg-muted/40"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="website"
                        type="url"
                        value={form.website}
                        onChange={(event) => handleFieldChange('website', event.target.value)}
                        placeholder="https://company.com"
                        className="h-12 bg-muted/40 pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="logo_url">Logo URL</Label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="logo_url"
                        type="url"
                        value={form.logo_url}
                        onChange={(event) => handleFieldChange('logo_url', event.target.value)}
                        placeholder="https://cdn.company.com/logo.png"
                        className="h-12 bg-muted/40 pl-10"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border/50 bg-muted/20 p-5">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  Preview
                </p>
                <div className="mt-4 rounded-2xl border border-border/50 bg-background p-5 shadow-sm">
                  <div className="flex items-center gap-4">
                    {form.logo_url ? (
                      <div
                        className="h-14 w-14 rounded-2xl border border-border/50 bg-cover bg-center"
                        style={{ backgroundImage: `url(${form.logo_url})` }}
                        aria-label="Company logo preview"
                      />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-blue-500/15 to-indigo-500/15 text-blue-600">
                        <Building2 className="h-7 w-7" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-lg font-semibold">{form.name || 'Your company name'}</p>
                      <p className="truncate text-sm text-muted-foreground">
                        {form.website || 'Add a website to help candidates verify your brand'}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 line-clamp-5 text-sm leading-relaxed text-muted-foreground">
                    {form.description || 'Your company description will appear here once you add one.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-border/40 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDraft(null)}
                disabled={saving || draft === null}
              >
                Reset
              </Button>
              <Button type="submit" disabled={saving} className="btn-gradient min-w-36">
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      {canTransferOwnership ? (
      <Card className="border-red-200/70 bg-red-50/40 dark:border-red-950/60 dark:bg-red-950/10">
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10 text-red-600">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-red-700 dark:text-red-300">Danger Zone</CardTitle>
              <CardDescription className="text-red-700/80 dark:text-red-300/80">
                Owner-only actions that affect company control should be handled deliberately.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-2xl border border-red-200/80 bg-background/90 p-5 dark:border-red-950/80">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-xl">
                <div className="flex items-center gap-2 text-base font-semibold">
                  <Crown className="h-4.5 w-4.5 text-amber-500" />
                  Transfer Ownership
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Promote another active member to OWNER. Your role will be downgraded to ADMIN after transfer.
                </p>
              </div>

              <div className="w-full max-w-md space-y-3">
                {loadingMembers ? (
                  <Skeleton className="h-12 rounded-lg" />
                ) : ownershipCandidates.length > 0 ? (
                  <>
                    <Select
                      value={selectedTransferMemberId}
                      onValueChange={(value) => setSelectedTransferMemberId(value ?? '')}
                    >
                      <SelectTrigger className="h-12 w-full bg-background">
                        <SelectValue placeholder="Select an active member" />
                      </SelectTrigger>
                      <SelectContent>
                        {ownershipCandidates.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.email} ({member.role})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button
                      type="button"
                      variant="destructive"
                      className="h-11 w-full justify-center"
                      disabled={!selectedTransferMemberId || transferring}
                      onClick={() => setConfirmTransferOpen(true)}
                    >
                      {transferring ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <AlertTriangle className="mr-2 h-4 w-4" />}
                      Transfer Ownership
                    </Button>
                  </>
                ) : (
                  <div className="rounded-xl border border-dashed border-red-200/80 px-4 py-3 text-sm text-muted-foreground dark:border-red-950/80">
                    Add at least one active ADMIN or RECRUITER before ownership can be transferred.
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      ) : null}

      <ConfirmModal
        open={confirmTransferOpen}
        onOpenChange={setConfirmTransferOpen}
        title="Transfer Company Ownership"
        description={selectedTransferMember
          ? `This will make ${selectedTransferMember.email} the new owner and downgrade your membership to admin.`
          : 'Choose an active member before continuing.'}
        confirmLabel="Transfer Ownership"
        variant="destructive"
        loading={transferring}
        onConfirm={handleTransferOwnership}
      />
    </div>
  );
}

