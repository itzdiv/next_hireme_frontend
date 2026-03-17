'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthStore, useCompanyStore } from '@/lib/store';
import { useMyCompanies } from '@/lib/hooks/useCompany';
import { SavedJobsButton } from '@/components/layout/SavedJobsButton';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Briefcase, LogOut, User, Building2, ChevronDown, Menu,
  Plus, LayoutDashboard, Check, ChevronsUpDown,
} from 'lucide-react';
import type { MemberRole, MyCompanyMembership } from '@/types';
import { MemberStatus } from '@/types';

function RoleTag({ role }: { role: MemberRole }) {
  const colors: Record<MemberRole, string> = {
    OWNER: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
    ADMIN: 'bg-primary-light text-primary-text dark:text-primary',
    RECRUITER: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${colors[role] ?? 'bg-muted text-muted-foreground'}`}>
      {role}
    </span>
  );
}

function CompanyAvatar({ name, logoUrl, size = 32 }: { name: string; logoUrl: string | null; size?: number }) {
  const [imgError, setImgError] = useState(false);
  const initial = name[0]?.toUpperCase() ?? 'C';
  const colors = [
    { bg: '#EFF6FF', text: '#1E40AF' },
    { bg: '#F0FDF4', text: '#166534' },
    { bg: '#FFF7ED', text: '#9A3412' },
    { bg: '#FDF4FF', text: '#6B21A8' },
    { bg: '#FFF1F2', text: '#9F1239' },
    { bg: '#F0FDFA', text: '#134E4A' },
  ];
  const color = colors[name.charCodeAt(0) % colors.length] ?? colors[0];

  if (logoUrl && !imgError) {
    return (
      <div
        className="rounded-lg overflow-hidden shrink-0 select-none"
        style={{ width: size, height: size }}
      >
        <img
          src={logoUrl}
          alt={name}
          width={size}
          height={size}
          className="w-full h-full object-contain"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  return (
    <div
      className="flex items-center justify-center rounded-lg font-bold select-none shrink-0"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        backgroundColor: color.bg,
        color: color.text,
      }}
    >
      {initial}
    </div>
  );
}

function CompanySwitcher({
  companies,
  activeCompanyId,
  onSelect,
  onCreateNew,
}: {
  companies: MyCompanyMembership[];
  activeCompanyId: string | null;
  onSelect: (companyId: string) => void;
  onCreateNew: () => void;
}) {
  const active = companies.find((c) => c.company_id === activeCompanyId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex min-h-9 max-w-60 items-center gap-2 rounded-md border border-border/60 bg-card/50 px-2.5 py-2 text-sm transition-colors hover:bg-accent focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50">
          {active ? (
            <>
              <CompanyAvatar name={active.company_name} logoUrl={active.company_logo_url} size={22} />
              <span className="truncate font-medium" title={active.company_name}>{active.company_name}</span>
            </>
          ) : (
            <>
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Select Company</span>
            </>
          )}
          <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72 border-border/40">
        <DropdownMenuLabel className="text-xs text-muted-foreground font-medium">
          Your Companies
        </DropdownMenuLabel>
        <DropdownMenuGroup>
          {companies.map((company) => {
            const isActive = company.company_id === activeCompanyId;
            return (
              <DropdownMenuItem
                key={company.company_id}
                onClick={() => onSelect(company.company_id)}
                className={`flex items-center gap-3 py-2.5 ${isActive ? 'bg-primary-light' : ''}`}
              >
                <CompanyAvatar name={company.company_name} logoUrl={company.company_logo_url} size={28} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{company.company_name}</p>
                  <RoleTag role={company.role} />
                </div>
                {isActive && <Check className="h-4 w-4 text-primary shrink-0" />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onCreateNew} className="gap-2">
          <Plus className="h-4 w-4" />
          Create New Company
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function getSelectedCompanyId(params: {
  hasActiveCompany: boolean;
  activeCompanyId: string | null;
  hasCompanies: boolean;
  activeMembershipCompanies: MyCompanyMembership[];
  myCompaniesLoading: boolean;
}): string | null {
  const {
    hasActiveCompany,
    activeCompanyId,
    hasCompanies,
    activeMembershipCompanies,
    myCompaniesLoading,
  } = params;

  if (hasActiveCompany) return activeCompanyId;
  if (hasCompanies) return activeMembershipCompanies[0].company_id;
  if (myCompaniesLoading) return activeCompanyId;
  return null;
}

function ProfileAvatar({ email, photoUrl }: { email: string | null; photoUrl: string | null }) {
  const [imgError, setImgError] = useState(false);
  const initial = email?.[0]?.toUpperCase() ?? 'U';

  if (photoUrl && !imgError) {
    return (
      <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 select-none">
        <Image
          src={photoUrl}
          alt="Profile"
          width={36}
          height={36}
          className="w-full h-full object-cover"
          unoptimized
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm text-white shrink-0 select-none"
      style={{ backgroundColor: '#2563EB' }}
    >
      {initial}
    </div>
  );
}

export default function Navbar() {
  const { isAuthenticated, isHydrated, logout, email, photoUrl } = useAuthStore();
  const { activeCompanyId, setActiveCompany } = useCompanyStore();
  const { data: myCompanies, loading: myCompaniesLoading } = useMyCompanies();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleSelectCompany = (companyId: string) => {
    setActiveCompany(companyId);
    router.push(`/companies/${companyId}`);
  };

  const handleCreateCompany = () => {
    router.push('/companies/new');
  };

  const showAuth = isHydrated;
  const activeMembershipCompanies = myCompanies.filter((company) => company.status === MemberStatus.ACTIVE);
  const hasCompanies = activeMembershipCompanies.length > 0;
  const hasActiveCompany =
    !!activeCompanyId && activeMembershipCompanies.some((company) => company.company_id === activeCompanyId);
  const selectedCompanyId = getSelectedCompanyId({
    hasActiveCompany,
    activeCompanyId,
    hasCompanies,
    activeMembershipCompanies,
    myCompaniesLoading,
  });

  useEffect(() => {
    if (!showAuth || !isAuthenticated) return;

    if (myCompaniesLoading) {
      return;
    }

    if (!hasCompanies) {
      if (activeCompanyId) {
        setActiveCompany(null);
      }
      return;
    }

    if (!hasActiveCompany) {
      setActiveCompany(activeMembershipCompanies[0].company_id);
    }
  }, [
    showAuth,
    isAuthenticated,
    myCompaniesLoading,
    hasCompanies,
    hasActiveCompany,
    activeMembershipCompanies,
    activeCompanyId,
    setActiveCompany,
  ]);

  const isCompanyPage = pathname.startsWith('/companies/') && pathname !== '/companies/new';
  const employerHref = '/companies/new';

  const navLinks = [
    { label: 'Browse Jobs', href: '/jobs', show: true },
    { label: 'Employer', href: employerHref, show: true },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50">
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-80 pt-12 border-border/40">
              <div className="flex flex-col gap-1">
                {navLinks.filter((l) => l.show).map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      pathname === link.href || pathname.startsWith(link.href + '/')
                        ? 'bg-primary-light text-primary-text'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}

                {showAuth && isAuthenticated && (
                  <>
                    <div className="my-2 border-t border-border/40" />

                    {hasCompanies ? (
                      <>
                        <p className="px-3 pt-1 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Your Companies
                        </p>
                        {activeMembershipCompanies.map((company) => {
                          const isActive = company.company_id === selectedCompanyId;
                          return (
                            <button
                              key={company.company_id}
                              onClick={() => {
                                setMobileOpen(false);
                                handleSelectCompany(company.company_id);
                              }}
                              className={`flex min-h-9 w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 ${
                                isActive
                                  ? 'bg-primary-light text-primary-text'
                                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                              }`}
                            >
                              <CompanyAvatar name={company.company_name} logoUrl={company.company_logo_url} size={24} />
                              <div className="flex-1 min-w-0">
                                <span className="block truncate" title={company.company_name}>{company.company_name}</span>
                                <RoleTag role={company.role} />
                              </div>
                              {isActive && <Check className="h-4 w-4 text-primary shrink-0" />}
                            </button>
                          );
                        })}
                        <div className="my-2 border-t border-border/40" />
                      </>
                    ) : (
                      <div className="mx-3 my-2 rounded-lg border border-dashed border-border/60 p-3 text-xs text-muted-foreground">
                        No companies yet. Create your first company to start hiring.
                      </div>
                    )}

                    <Link
                      href="/profile"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                    <div className="my-2 border-t border-border/40" />
                    <button
                      onClick={() => {
                        setMobileOpen(false);
                        handleLogout();
                      }}
                      className="flex min-h-9 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>

          <Link href={showAuth && isAuthenticated ? '/jobs' : '/'} className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary shadow-lg shadow-blue-500/25">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              HireMe
            </span>
          </Link>

          {showAuth && isAuthenticated && hasCompanies && !isCompanyPage && (
            <div className="hidden md:block ml-3">
              <CompanySwitcher
                companies={activeMembershipCompanies}
                activeCompanyId={selectedCompanyId}
                onSelect={handleSelectCompany}
                onCreateNew={handleCreateCompany}
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1">
            {navLinks.filter((l) => l.show).map((link) => (
              <Link key={link.href} href={link.href}>
                <Button
                  variant={pathname === link.href || pathname.startsWith(link.href + '/') ? 'secondary' : 'ghost'}
                  size="sm"
                  className="text-sm"
                >
                  {link.label === 'Employer' ? <Building2 className="h-4 w-4" /> : null}
                  {link.label}
                </Button>
              </Link>
            ))}
          </div>

          {!showAuth ? (
            <div className="w-24" />
          ) : isAuthenticated ? (
            <div className="flex items-center gap-2">
              <SavedJobsButton />

              {selectedCompanyId && !isCompanyPage && (
                <Link href={`/companies/${selectedCompanyId}`} className="hidden sm:block">
                  <Button variant="ghost" size="sm" className="text-sm gap-1.5">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger className="ml-1 inline-flex min-h-9 items-center gap-2 rounded-md px-2 py-1 text-sm hover:bg-accent focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50">
                  <ProfileAvatar email={email} photoUrl={photoUrl} />
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 border-border/40">
                  <DropdownMenuLabel className="text-xs text-muted-foreground font-normal truncate" title={email ?? undefined}>
                    {email ?? 'User'}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => router.push('/profile')}>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/applications')}>
                      <Briefcase className="mr-2 h-4 w-4" />
                      My Applications
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/resumes')}>
                      <User className="mr-2 h-4 w-4" />
                      My Resumes
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="hidden sm:flex">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="btn-gradient">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}


