'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { useCreateCompany } from '@/lib/hooks/useCompany';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Building2, Link as LinkIcon } from 'lucide-react';
import Navbar from '@/components/shared/Navbar';
import { DashboardFooter } from '@/components/layout/DashboardFooter';

export default function NewCompanyPage() {
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuthStore();
  const { mutate: createCompany, loading } = useCreateCompany();

  const [form, setForm] = useState({
    name: '',
    description: '',
    website: '',
    logo_url: '',
  });

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isHydrated, isAuthenticated, router]);

  if (!isHydrated || !isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center py-32">
          <div className="animate-pulse space-y-4 text-center">
            <div className="h-16 w-16 bg-muted rounded-2xl mx-auto" />
            <div className="h-8 w-48 bg-muted rounded mx-auto" />
          </div>
        </div>
        <DashboardFooter />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || form.name.trim().length < 2) {
      toast.error('Company name is required (min 2 characters)');
      return;
    }
    try {
      const company = await createCompany({
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        website: form.website.trim() || undefined,
        logo_url: form.logo_url.trim() || undefined,
      });
      toast.success('Company created successfully!');
      router.push(`/companies/${company.id}`);
    } catch {
      toast.error('Failed to create company');
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-blue-500/20 to-indigo-500/20 mb-4 shadow-lg shadow-blue-500/10">
            <Building2 className="h-8 w-8 text-blue-500" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Create Your Company</h1>
          <p className="mt-2 text-muted-foreground">
            Set up your organization profile to start posting jobs and hiring talent.
          </p>
        </div>

        <Card className="border-border/40 bg-card/50 backdrop-blur-xl shadow-2xl">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Company Details</CardTitle>
              <CardDescription>Provide basic information about your organization.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Company Name *</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Acme Inc."
                    required
                    minLength={2}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">About the Company</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="What does your company do? What is your mission?"
                  rows={4}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="website">Website URL</Label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="website"
                      type="url"
                      value={form.website}
                      onChange={(e) => setForm({ ...form, website: e.target.value })}
                      placeholder="https://acme.com"
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logo_url">Logo URL</Label>
                  <Input
                    id="logo_url"
                    type="url"
                    value={form.logo_url}
                    onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
                    placeholder="https://cdn.acme.com/logo.png"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-3 border-t border-border/40 pt-4 bg-muted/20">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="btn-gradient"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Company
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
      </main>
      <DashboardFooter />
    </div>
  );
}


