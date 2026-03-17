"use client";

import Link from 'next/link';
import { Briefcase, Github, Linkedin, Twitter } from 'lucide-react';
import { useMyCompanies } from '@/lib/hooks/useCompany';
import { useAuthStore, useCompanyStore } from '@/lib/store';
import { MemberStatus } from '@/types';

const LEGAL_LINKS = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Contact Support', href: 'mailto:support@hireme.com' },
];

const SOCIAL_LINKS = [
  { label: 'LinkedIn', href: 'https://linkedin.com', Icon: Linkedin },
  { label: 'Twitter', href: 'https://twitter.com', Icon: Twitter },
  { label: 'GitHub', href: 'https://github.com', Icon: Github },
];

export function PublicFooter() {
  const { isAuthenticated, isHydrated } = useAuthStore();
  const { activeCompanyId } = useCompanyStore();
  const { data: myCompanies } = useMyCompanies();
  const year = new Date().getFullYear();
  const activeMembershipCompanies = myCompanies.filter((company) => company.status === MemberStatus.ACTIVE);
  const selectedCompanyId = activeMembershipCompanies.some((company) => company.company_id === activeCompanyId)
    ? activeCompanyId
    : activeMembershipCompanies[0]?.company_id ?? null;
  const companySetupHref = '/companies/new';
  const companyBaseHref = selectedCompanyId ? `/companies/${selectedCompanyId}` : companySetupHref;
  const seekerLinks = [
    { label: 'Browse Jobs', href: '/jobs' },
    { label: 'My Applications', href: isHydrated && isAuthenticated ? '/applications' : '/login' },
    { label: 'Upload Resume', href: isHydrated && isAuthenticated ? '/resumes' : '/login' },
    { label: 'Create Profile', href: isHydrated && isAuthenticated ? '/profile' : '/register' },
  ];
  const companyLinks = [
    { label: 'Post a Job', href: selectedCompanyId ? `${companyBaseHref}/jobs/new` : companySetupHref },
    { label: 'Manage Applications', href: selectedCompanyId ? `${companyBaseHref}/applications` : companySetupHref },
    { label: 'Build Your Team', href: selectedCompanyId ? `${companyBaseHref}/members` : companySetupHref },
    { label: 'Question Banks', href: selectedCompanyId ? `${companyBaseHref}/question-banks` : companySetupHref },
  ];

  return (
    <footer className="mt-auto bg-zinc-900 text-zinc-400">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2.5 w-fit">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-white">HireMe</span>
            </Link>
            <p className="text-sm leading-relaxed text-zinc-400">
              The modern hiring platform for teams that move fast.
            </p>
            <p className="text-xs text-zinc-500">© {year} HireMe. All rights reserved.</p>
          </div>

          <FooterLinkColumn title="For Job Seekers" links={seekerLinks} />
          <FooterLinkColumn title="For Companies" links={companyLinks} />
          <FooterLinkColumn title="Company" links={LEGAL_LINKS} />
        </div>
      </div>

      <div className="border-t border-zinc-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-6 sm:flex-row">
          <span className="text-xs text-zinc-500">© {year} HireMe. All rights reserved.</span>
          <div className="flex items-center gap-4">
            {SOCIAL_LINKS.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="text-zinc-500 transition-opacity hover:opacity-70"
              >
                <Icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLinkColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <ul className="flex flex-col gap-2.5">
        {links.map((link) => (
          <li key={link.label}>
            {link.href.startsWith('mailto:') ? (
              <a href={link.href} className="text-sm transition-colors hover:text-white">
                {link.label}
              </a>
            ) : (
              <Link href={link.href} className="text-sm transition-colors hover:text-white">
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}