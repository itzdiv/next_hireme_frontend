'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';

interface SavedJob {
  id: string;
  title: string;
  company_name: string;
  location: string | null;
  saved_at: string;
}

export function SavedJobsButton() {
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>(() => {
    try {
      const stored = localStorage.getItem('hireme_saved_jobs');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    function handleStorage() {
      try {
        const stored = localStorage.getItem('hireme_saved_jobs');
        setSavedJobs(stored ? JSON.parse(stored) : []);
      } catch {
        setSavedJobs([]);
      }
    }

    window.addEventListener('hireme_saved_jobs_updated', handleStorage);

    return () => {
      window.removeEventListener('hireme_saved_jobs_updated', handleStorage);
    };
  }, []);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="relative rounded-full p-2 transition-colors hover:bg-muted"
        aria-label="Saved jobs"
      >
        <Heart
          className={`h-5 w-5 transition-colors ${
            savedJobs.length > 0 ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
          }`}
        />
        {savedJobs.length > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {savedJobs.length > 9 ? '9+' : savedJobs.length}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border bg-background shadow-xl">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <span className="text-sm font-semibold">Saved Jobs</span>
              {savedJobs.length > 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem('hireme_saved_jobs');
                    setSavedJobs([]);
                    window.dispatchEvent(new Event('hireme_saved_jobs_updated'));
                  }}
                  className="text-xs text-muted-foreground transition-colors hover:text-red-500"
                >
                  Clear all
                </button>
              ) : null}
            </div>

            {savedJobs.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                No saved jobs yet.
                <br />
                Click the heart on any job to save it.
              </div>
            ) : (
              <div className="max-h-80 divide-y overflow-y-auto">
                {savedJobs.map((job) => (
                  <Link
                    key={job.id}
                    href={`/jobs/${job.id}`}
                    onClick={() => setIsOpen(false)}
                    className="flex flex-col gap-0.5 px-4 py-3 transition-colors hover:bg-muted"
                  >
                    <span className="truncate text-sm font-medium">{job.title}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {job.company_name}
                      {job.location ? ` · ${job.location}` : ''}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}