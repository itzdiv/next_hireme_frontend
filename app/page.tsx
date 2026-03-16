'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  PlayCircle,
  Users,
  Database,
  CheckCircle2,
  UserSearch,
} from 'lucide-react';
import Navbar from '@/components/shared/Navbar';
import { PublicFooter } from '@/components/layout/PublicFooter';

type Kpi = {
  label: string;
  value: number;
  suffix: string;
  decimals?: number;
};

const kpis: Kpi[] = [
  { label: 'Uptime SLA', value: 99.98, suffix: '%', decimals: 2 },
  { label: 'Monthly Audit Events', value: 1248000, suffix: '' },
  { label: 'Enterprise Teams', value: 420, suffix: '' },
  { label: 'Policy Compliance', value: 97.4, suffix: '%', decimals: 2 },
];

const modules = [
  {
    title: 'Role-Based Team Access',
    description:
      'Invite recruiters, admins, and owners with the right permissions. Full control over who can post jobs, review applications, and accept candidates.',
    icon: Users,
    iconBg: 'bg-blue-50 text-blue-600',
  },
  {
    title: 'Smart Candidate Screening',
    description:
      'Build reusable question banks and attach them to any job. Collect text, number, boolean, or multiple-choice answers — automatically saved with each application.',
    icon: UserSearch,
    iconBg: 'bg-emerald-50 text-emerald-600',
  },
  {
    title: 'Application Pipeline Visibility',
    description:
      'Track every application from APPLIED to ACCEPTED in real time. Leave internal notes or send candidate-visible feedback directly from your dashboard.',
    icon: Database,
    iconBg: 'bg-slate-100 text-slate-700',
  },
];

const auditRows = [
  { candidate: 'Arjun Mehta', job: 'Backend Engineer', status: 'Applied', applied: '2h ago', resume: 'PDF' },
  { candidate: 'Nisha Verma', job: 'Product Designer', status: 'Accepted', applied: '5h ago', resume: 'PDF' },
  { candidate: 'Rohit Singh', job: 'Frontend Engineer', status: 'Rejected', applied: '1d ago', resume: 'PDF' },
  { candidate: 'Sara Khan', job: 'Data Analyst', status: 'Applied', applied: '1d ago', resume: 'PDF' },
  { candidate: 'Kabir Joshi', job: 'QA Engineer', status: 'Applied', applied: '2d ago', resume: 'PDF' },
];

const faqItems = [
  {
    question: 'How do I post a job?',
    answer:
      'Create a company, invite your team, and post a job in DRAFT. When you are ready, publish it — it appears on the public job board instantly.',
  },
  {
    question: 'Can candidates see recruiter comments?',
    answer:
      'Only comments marked visible to candidate are shown. Internal team notes stay private — perfect for pipeline discussions.',
  },
  {
    question: 'What happens when the application deadline passes?',
    answer:
      'Jobs automatically close when the deadline is reached. No applications can be submitted after that point, and the job is marked CLOSED.',
  },
];

const applyModes = [
  {
    title: 'STANDARD',
    description: 'Resume-only. Fast and simple.',
  },
  {
    title: 'QUESTIONNAIRE',
    description: 'Resume + your custom screening questions.',
  },
  {
    title: 'VIDEO',
    description: 'Resume + a video submission link.',
  },
];

function formatMetric(value: number, decimals = 0) {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export default function LandingPage() {
  const [hasAnimated, setHasAnimated] = useState(false);
  const [counts, setCounts] = useState(() => kpis.map(() => 0));
  const statsRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!statsRef.current || hasAnimated) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || hasAnimated) {
          return;
        }
        setHasAnimated(true);
        const start = performance.now();
        const duration = 2000;

        const step = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 4);
          setCounts(kpis.map((kpi) => kpi.value * eased));
          if (progress < 1) {
            requestAnimationFrame(step);
          }
        };

        requestAnimationFrame(step);
        observer.disconnect();
      },
      { threshold: 0.35 }
    );

    observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, [hasAnimated]);

  return (
    <div className="font-satoshi flex min-h-screen flex-col bg-white text-slate-900">
      <Navbar />

      <main className="flex-1">
        <section className="enterprise-grid animate-fade-in-up relative overflow-hidden px-6 pt-32 pb-32">
          <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-[#eff6ff] px-4 py-2 text-sm font-medium text-blue-700">
              ✦ Now live — post your first job in minutes
            </div>

            <h1 className="max-w-4xl text-5xl font-extrabold leading-tight tracking-[-0.02em] text-slate-900 md:text-6xl lg:text-[72px] lg:leading-[1.05]">
              The Hiring Platform Built for Modern Teams
            </h1>
            <p className="mt-8 max-w-3xl text-lg leading-relaxed text-slate-600">
              HireMe connects great companies with great candidates — with role-based access, smart screening, and full application visibility for your whole team.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/companies/new"
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#2563eb] px-6 text-sm font-semibold text-white transition-transform duration-200 ease-in-out hover:scale-[1.02]"
              >
                Post a Job
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/jobs"
                className="inline-flex h-11 items-center gap-2 rounded-lg border border-[#e2e8f0] bg-white px-6 text-sm font-semibold text-slate-700 transition-colors duration-200 ease-in-out hover:bg-slate-50"
              >
                <PlayCircle className="h-4 w-4" />
                Browse Open Roles
              </Link>
            </div>
          </div>
        </section>

        <section className="animate-fade-in-up px-6 py-32" style={{ animationDelay: '0.05s' }}>
          <div className="mx-auto max-w-7xl rounded-xl border border-[#e2e8f0] bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-[#e2e8f0] px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
              <div className="ml-3 h-8 flex-1 rounded-md border border-[#e2e8f0] bg-slate-50 px-3 text-xs leading-8 text-slate-500">
                app.hireme.enterprise/overview
              </div>
            </div>

            <div className="grid min-h-140 grid-cols-1 lg:grid-cols-[256px_1fr]">
              <aside className="border-r border-[#e2e8f0] bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Recruiter Dashboard</p>
                <ul className="mt-4 space-y-2 text-sm">
                  <li className="rounded-md bg-white px-3 py-2 font-medium text-slate-900">All Jobs</li>
                  <li className="rounded-md px-3 py-2 text-slate-600">Applications</li>
                  <li className="rounded-md px-3 py-2 text-slate-600">Question Banks</li>
                  <li className="rounded-md px-3 py-2 text-slate-600">Team Members</li>
                </ul>
              </aside>

              <div className="p-6">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e2e8f0] pb-4">
                  <h3 className="text-lg font-bold tracking-[-0.02em] text-slate-900">Applications Overview</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-blue-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
                      3 new applications today
                    </span>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  {[
                    { label: 'Open Jobs', value: '12' },
                    { label: 'Applications', value: '348' },
                    { label: 'Interviews Scheduled', value: '27' },
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl border border-[#e2e8f0] bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.08em] text-slate-500">{item.label}</p>
                      <p className="mt-2 text-2xl font-bold tracking-[-0.02em] text-slate-900">{item.value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 overflow-hidden rounded-xl border border-[#e2e8f0]">
                  <div className="max-h-72 overflow-auto">
                    <table className="w-full border-collapse text-sm">
                      <thead className="sticky top-0 bg-slate-50 text-left text-xs uppercase tracking-[0.08em] text-slate-500">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Candidate</th>
                          <th className="px-4 py-3 font-semibold">Job</th>
                          <th className="px-4 py-3 font-semibold">Status</th>
                          <th className="px-4 py-3 font-semibold">Applied</th>
                          <th className="px-4 py-3 text-right font-semibold">Resume</th>
                        </tr>
                      </thead>
                      <tbody>
                        {auditRows.map((row) => (
                          <tr
                            key={`${row.candidate}-${row.job}`}
                            className="border-t border-[#e2e8f0] transition-colors duration-200 hover:bg-[#eff6ff]"
                          >
                            <td className="px-4 py-3 text-slate-700">{row.candidate}</td>
                            <td className="px-4 py-3 text-slate-600">{row.job}</td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                  row.status === 'Accepted'
                                    ? 'bg-green-100 text-green-800'
                                    : row.status === 'Rejected'
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {row.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-slate-400">{row.applied}</td>
                            <td className="px-4 py-3 text-right text-slate-600">📄 {row.resume}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="animate-fade-in-up px-6 py-32" style={{ animationDelay: '0.1s' }}>
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 max-w-2xl">
              <h2 id="modules" className="text-4xl font-extrabold tracking-[-0.02em] text-slate-900">
                Everything Your Hiring Team Needs
              </h2>
              <p className="mt-3 text-base leading-relaxed text-slate-600">
                End-to-end hiring workflows — from job post to offer letter.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {modules.map((module) => (
                <article
                  key={module.title}
                  className="rounded-xl border border-[#e2e8f0] bg-slate-50 p-6 transition-all duration-200 ease-in-out hover:bg-white hover:shadow-xl hover:shadow-slate-200/50"
                >
                  <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg ${module.iconBg}`}>
                    <module.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-bold tracking-[-0.02em] text-slate-900">{module.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{module.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          ref={statsRef}
          className="animate-fade-in-up relative overflow-hidden bg-[#020617] px-6 py-32"
          style={{ animationDelay: '0.15s' }}
        >
          <div className="pointer-events-none absolute inset-0 opacity-10" aria-hidden="true">
            <div className="absolute left-1/2 top-1/2 h-155 w-155 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white" />
            <div className="absolute left-1/2 top-1/2 h-120 w-120 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white" />
            <div className="absolute left-1/2 top-1/2 h-85 w-85 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white" />
          </div>
          <div className="relative mx-auto max-w-7xl">
            <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
              {kpis.map((kpi, index) => (
                <div key={kpi.label}>
                  <p className="text-4xl font-extrabold tracking-[-0.02em] text-[#60a5fa]">
                    {formatMetric(counts[index], kpi.decimals ?? 0)}
                    {kpi.suffix}
                  </p>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{kpi.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="security" className="animate-fade-in-up px-6 py-32" style={{ animationDelay: '0.2s' }}>
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2">
            <div>
              <h2 className="text-4xl font-extrabold tracking-[-0.02em] text-slate-900">Three Ways Candidates Can Apply</h2>
              <p className="mt-4 text-base leading-relaxed text-slate-600">
                Give candidates the right application experience for each role, while your team sees everything in one pipeline.
              </p>
              <div className="mt-8 space-y-3">
                {[
                  'Use STANDARD for quick hiring cycles',
                  'Use QUESTIONNAIRE for skills screening',
                  'Use VIDEO for communication-first roles',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-slate-700">
                    <CheckCircle2 className="h-5 w-5 text-[#2563eb]" />
                    <span className="text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="rounded-xl border border-[#e2e8f0] bg-[rgba(255,255,255,0.7)] p-6 backdrop-blur-md">
                <h3 className="text-lg font-bold tracking-[-0.02em] text-slate-900">Application Modes</h3>
                <div className="mt-5 grid gap-3">
                  {applyModes.map((mode) => (
                    <article key={mode.title} className="rounded-lg border border-[#e2e8f0] bg-white p-4">
                      <h4 className="text-sm font-bold tracking-[-0.02em] text-slate-900">{mode.title}</h4>
                      <p className="mt-1 text-sm text-slate-600">{mode.description}</p>
                    </article>
                  ))}
                </div>
              </div>

              <div className="absolute -bottom-6 -left-6 rounded-xl border border-slate-700 bg-slate-800 p-4 shadow-xl">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-300">Smart Automation</p>
                <p className="mt-1 text-lg font-bold text-white">Applications auto-close when the deadline passes</p>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="animate-fade-in-up bg-[#f8fafc] px-6 py-32" style={{ animationDelay: '0.23s' }}>
          <div className="mx-auto max-w-7xl">
            <h2 className="text-center text-4xl font-extrabold tracking-[-0.02em] text-slate-900">How It Works</h2>
            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              <article className="rounded-xl border border-[#e2e8f0] bg-white p-6">
                <h3 className="text-xl font-bold tracking-[-0.02em] text-slate-900">For Companies</h3>
                <ul className="mt-4 space-y-2 text-sm text-slate-600">
                  <li>1. Create your company and invite your hiring team.</li>
                  <li>2. Post jobs and choose STANDARD, QUESTIONNAIRE, or VIDEO mode.</li>
                  <li>3. Review applications, add comments, and decide faster.</li>
                </ul>
                <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                  <Users className="h-3.5 w-3.5" />
                  OWNER → ADMIN → RECRUITER role hierarchy
                </div>
              </article>
              <article className="rounded-xl border border-[#e2e8f0] bg-white p-6">
                <h3 className="text-xl font-bold tracking-[-0.02em] text-slate-900">For Candidates</h3>
                <ul className="mt-4 space-y-2 text-sm text-slate-600">
                  <li>1. Browse public jobs and pick roles that fit your goals.</li>
                  <li>2. Apply using your resume and role-specific questions/video.</li>
                  <li>3. Track status updates and visible recruiter feedback.</li>
                </ul>
                <div className="mt-5 rounded-lg border border-[#e2e8f0] bg-slate-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">My Applications</p>
                  <div className="mt-2 flex gap-2 text-xs">
                    <span className="rounded-full bg-blue-100 px-2 py-1 font-semibold text-blue-800">APPLIED</span>
                    <span className="rounded-full bg-green-100 px-2 py-1 font-semibold text-green-800">ACCEPTED</span>
                    <span className="rounded-full bg-red-100 px-2 py-1 font-semibold text-red-800">REJECTED</span>
                  </div>
                </div>
              </article>
            </div>

            <div className="mt-8 rounded-xl border border-[#e2e8f0] bg-white p-6">
              <h3 className="text-lg font-bold tracking-[-0.02em] text-slate-900">Public Job Board Preview</h3>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {[
                  { title: 'Senior Backend Engineer', company: 'TechNova Labs', location: 'Bangalore · Hybrid' },
                  { title: 'Frontend Developer', company: 'PixelStack', location: 'Remote' },
                  { title: 'Product Designer', company: 'Northbridge', location: 'Mumbai · Onsite' },
                ].map((job) => (
                  <div key={job.title} className="rounded-lg border border-[#e2e8f0] bg-slate-50 p-4">
                    <p className="text-sm font-bold text-slate-900">{job.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{job.company}</p>
                    <p className="mt-1 text-xs text-slate-500">{job.location}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="faq" className="animate-fade-in-up bg-[#f8fafc] px-6 py-32" style={{ animationDelay: '0.25s' }}>
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center text-4xl font-extrabold tracking-[-0.02em] text-slate-900">Frequently Asked Questions</h2>
            <div className="mt-10 space-y-4">
              {faqItems.map((item) => (
                <article key={item.question} className="rounded-xl border border-[#e2e8f0] bg-white p-6">
                  <h3 className="text-lg font-bold tracking-[-0.02em] text-slate-900">{item.question}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="animate-fade-in-up px-6 py-32" style={{ animationDelay: '0.3s' }}>
          <div className="mx-auto max-w-5xl rounded-xl border border-[#e2e8f0] bg-white p-10 text-center">
            <h2 className="text-4xl font-extrabold tracking-[-0.02em] text-slate-900">Ready to Hire Better?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600">
              Post your first job in minutes. HireMe handles the applications, your team handles the decisions.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/companies/new"
                className="inline-flex h-11 items-center rounded-lg bg-[#2563eb] px-6 text-sm font-semibold text-white transition-colors duration-200 ease-in-out hover:bg-blue-700"
              >
                Create Your Company
              </Link>
              <Link
                href="/jobs"
                className="inline-flex h-11 items-center rounded-lg border border-[#e2e8f0] bg-white px-6 text-sm font-semibold text-slate-700 transition-colors duration-200 ease-in-out hover:bg-slate-50"
              >
                Browse Open Roles
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
