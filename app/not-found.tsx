import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="text-center">
        <p className="text-7xl font-bold bg-linear-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
          404
        </p>
        <h1 className="mt-4 text-2xl font-bold">Page not found</h1>
        <p className="mt-2 text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link href="/" className="mt-6 inline-block">
          <Button>Go Home</Button>
        </Link>
      </div>
    </div>
  );
}

