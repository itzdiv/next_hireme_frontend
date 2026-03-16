import Link from 'next/link';

export function DashboardFooter() {
  return (
    <footer className="border-t bg-background px-6 py-3">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>© {new Date().getFullYear()} HireMe</span>
        <div className="flex items-center gap-4">
          <Link href="/privacy" className="transition-colors hover:text-foreground">
            Privacy
          </Link>
          <Link href="/terms" className="transition-colors hover:text-foreground">
            Terms
          </Link>
          <a href="mailto:support@hireme.com" className="transition-colors hover:text-foreground">
            Support
          </a>
        </div>
      </div>
    </footer>
  );
}