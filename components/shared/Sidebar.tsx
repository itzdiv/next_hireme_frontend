'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useParams, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useCompany, useMyCompanies } from '@/lib/hooks/useCompany';
import { useAuthStore, useCompanyStore } from '@/lib/store';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  HelpCircle,
  Settings,
  Building2,
  LogOut,
  ChevronRight,
  ChevronsUpDown,
  Check,
  Plus,
  ArrowLeft,
} from 'lucide-react';
import { MemberRole } from '@/types';

const sidebarItems = [
  { label: 'Dashboard', href: '', icon: LayoutDashboard },
  { label: 'Jobs', href: '/jobs', icon: Briefcase },
  { label: 'Applications', href: '/applications', icon: FileText },
  { label: 'Question Banks', href: '/question-banks', icon: HelpCircle },
  { label: 'Team', href: '/members', icon: Users },
  { label: 'Settings', href: '/settings', icon: Settings },
];

function RoleTag({ role }: { role: MemberRole }) {
  const colors: Record<MemberRole, string> = {
    OWNER: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
    ADMIN: 'bg-blue-500/15 text-blue-700 dark:text-blue-400',
    RECRUITER: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${colors[role] ?? 'bg-muted text-muted-foreground'}`}>
      {role}
    </span>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const companyId = params.companyId as string;
  const basePath = `/companies/${companyId}`;
  const { data: company } = useCompany(companyId);
  const { data: myCompanies } = useMyCompanies();
  const { logout } = useAuthStore();
  const { setActiveCompany } = useCompanyStore();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleSwitchCompany = (targetCompanyId: string) => {
    setActiveCompany(targetCompanyId);
    router.push(`/companies/${targetCompanyId}`);
  };

  const hasMultipleCompanies = myCompanies.length > 1;
  const activeMembership = myCompanies.find((company) => company.company_id === companyId);
  const activeRole = activeMembership?.role;
  const visibleSidebarItems = sidebarItems.filter((item) => {
    if (activeRole === MemberRole.RECRUITER) {
      return item.label !== 'Settings' && item.label !== 'Team';
    }
    return true;
  });

  return (
    <>
      <aside className="hidden lg:flex w-64 flex-col border-r border-border/40 bg-card/50 backdrop-blur-sm">
        <div className="border-b border-border/40">
          {hasMultipleCompanies ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex min-h-10 w-full items-center gap-3 p-4 text-left transition-colors hover:bg-accent/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50">
                  {company?.logo_url ? (
                    <Image
                      src={company.logo_url}
                      alt={`${company?.name || 'Company'} logo`}
                      width={36}
                      height={36}
                      unoptimized
                      className="h-9 w-9 rounded-lg object-cover border border-border/40 shrink-0"
                    />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-linear-to-br from-blue-500/20 to-indigo-500/20 shrink-0">
                      <Building2 className="h-5 w-5 text-blue-500" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" title={company?.name || 'Loading...'}>{company?.name || 'Loading...'}</p>
                    <p className="text-xs text-muted-foreground">
                      {myCompanies.find((c) => c.company_id === companyId)?.role ?? 'Dashboard'}
                    </p>
                  </div>
                  <ChevronsUpDown className="h-4 w-4 text-muted-foreground shrink-0" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" sideOffset={4} className="w-60 border-border/40">
                <p className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Switch Company
                </p>
                {myCompanies.map((c) => {
                  const isActive = c.company_id === companyId;
                  return (
                    <DropdownMenuItem
                      key={c.company_id}
                      onClick={() => handleSwitchCompany(c.company_id)}
                      className={`flex items-center gap-3 py-2.5 ${isActive ? 'bg-blue-500/5' : ''}`}
                    >
                      {c.company_logo_url ? (
                        <Image
                          src={c.company_logo_url}
                          alt={c.company_name}
                          width={28}
                          height={28}
                          unoptimized
                          className="h-7 w-7 rounded-md object-cover border border-border/40 shrink-0"
                        />
                      ) : (
                        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-linear-to-br from-blue-500/15 to-indigo-500/15 text-blue-600 text-xs font-bold shrink-0">
                          {c.company_name[0]?.toUpperCase() ?? 'C'}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" title={c.company_name}>{c.company_name}</p>
                        <RoleTag role={c.role} />
                      </div>
                      {isActive && <Check className="h-4 w-4 text-blue-600 shrink-0" />}
                    </DropdownMenuItem>
                  );
                })}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/companies/new')} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create New Company
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-3 p-4">
              {company?.logo_url ? (
                <Image
                  src={company.logo_url}
                  alt={`${company?.name || 'Company'} logo`}
                  width={36}
                  height={36}
                  unoptimized
                  className="h-9 w-9 rounded-lg object-cover border border-border/40 shrink-0"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-linear-to-br from-blue-500/20 to-indigo-500/20 shrink-0">
                  <Building2 className="h-5 w-5 text-blue-500" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" title={company?.name || 'Loading...'}>{company?.name || 'Loading...'}</p>
                <p className="text-xs text-muted-foreground">Dashboard</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1 p-3 flex-1">
          {myCompanies.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/60 p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">No companies found</p>
              <p className="mt-1">Create your first company to access recruiter tools.</p>
              <Link href="/companies/new" className="mt-3 inline-flex items-center text-blue-600 hover:text-blue-500">
                <Plus className="mr-1 h-4 w-4" />
                Create Your First Company
              </Link>
            </div>
          ) : visibleSidebarItems.map((item) => {
            const fullHref = `${basePath}${item.href}`;
            const isActive =
              item.href === ''
                ? pathname === basePath
                : pathname.startsWith(fullHref);

            return (
              <Link
                key={item.label}
                href={fullHref}
                className={cn(
                  'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-linear-to-r from-blue-500/10 to-indigo-500/10 text-blue-700 dark:text-blue-400 shadow-sm'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                <item.icon className={cn('h-4.5 w-4.5 shrink-0', isActive && 'text-blue-600 dark:text-blue-400')} />
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight className="h-3.5 w-3.5 text-blue-400 opacity-60" />}
              </Link>
            );
          })}
        </div>

        <div className="border-t border-border/40 p-3 space-y-1">
          <Link
            href="/jobs"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors w-full"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Job Board
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex min-h-9 w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border/40 bg-background/95 backdrop-blur-xl safe-area-inset-bottom">
        <div className="flex items-center justify-around py-2">
          {visibleSidebarItems.slice(0, 5).map((item) => {
            const fullHref = `${basePath}${item.href}`;
            const isActive =
              item.href === ''
                ? pathname === basePath
                : pathname.startsWith(fullHref);

            return (
              <Link
                key={item.label}
                href={fullHref}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-colors min-w-14',
                  isActive
                    ? 'text-blue-600'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}


