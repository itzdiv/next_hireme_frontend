'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useProfile, useCreateProfile, useUpdateProfile } from '@/lib/hooks/useCandidate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Loader2, Save, User, Link as LinkIcon, Phone, Pencil, X } from 'lucide-react';

/**
 * Creates or updates the authenticated candidate profile.
 */
export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo');
  const shouldStartInEdit = searchParams.get('edit') === 'true';
  const { data: profile, loading, notFound, refetch } = useProfile();
  const { mutate: createProfile, loading: creating } = useCreateProfile();
  const { mutate: updateProfile, loading: updating } = useUpdateProfile();
  const [isEditing, setIsEditing] = useState(shouldStartInEdit);

  const [draft, setDraft] = useState<Partial<{
    full_name: string;
    bio: string;
    photo_url: string;
    linkedin_url: string;
    portfolio_url: string;
    phone: string;
  }>>({});

  const form = {
    full_name: draft.full_name ?? profile?.full_name ?? '',
    bio: draft.bio ?? profile?.bio ?? '',
    photo_url: draft.photo_url ?? profile?.photo_url ?? '',
    linkedin_url: draft.linkedin_url ?? profile?.linkedin_url ?? '',
    portfolio_url: draft.portfolio_url ?? profile?.portfolio_url ?? '',
    phone: draft.phone ?? profile?.phone ?? '',
  };
  const isCreateMode = notFound;
  const isReadOnly = !isCreateMode && !isEditing;
  const isFullNameValid = form.full_name.trim().length >= 2;

  /**
   * Submits the profile form in create or update mode based on profile existence.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (notFound) {
        await createProfile({
          full_name: form.full_name,
          bio: form.bio || undefined,
          photo_url: form.photo_url || undefined,
          linkedin_url: form.linkedin_url || undefined,
          portfolio_url: form.portfolio_url || undefined,
          phone: form.phone || undefined,
        });
        toast.success('Profile created!');
      } else {
        await updateProfile({
          full_name: form.full_name || undefined,
          bio: form.bio || undefined,
          photo_url: form.photo_url || undefined,
          linkedin_url: form.linkedin_url || undefined,
          portfolio_url: form.portfolio_url || undefined,
          phone: form.phone || undefined,
        });
        toast.success('Profile updated!');
      }
      setDraft({});
      setIsEditing(false);
      await refetch();
      if (returnTo) {
        router.push(decodeURIComponent(returnTo));
      } else {
        router.push('/jobs');
      }
    } catch {
      toast.error('Failed to save profile');
    }
  };

  const isSubmitting = creating || updating;

  if (loading) {
    return (
      <div className="flex flex-1 flex-col space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          {notFound ? 'Create Your Profile' : 'Profile'}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {notFound
            ? 'Set up your candidate profile to start applying for jobs.'
            : 'Keep your profile up to date for recruiters.'}
        </p>
      </div>

      <Card className="border-border/40">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
            {!isCreateMode && (
              isEditing ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDraft({});
                    setIsEditing(false);
                  }}
                  disabled={isSubmitting}
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              ) : (
                <Button type="button" variant="outline" onClick={() => setIsEditing(true)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              )
            )}
          </div>
          <CardDescription>This info is visible to recruiters when you apply.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  value={form.full_name}
                  onChange={(e) => setDraft((current) => ({ ...current, full_name: e.target.value }))}
                  placeholder="John Doe"
                  required
                  minLength={2}
                  disabled={isReadOnly || isSubmitting}
                  className={isReadOnly ? 'bg-muted/60 text-muted-foreground' : undefined}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone (optional)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    value={form.phone}
                    onChange={(e) => setDraft((current) => ({ ...current, phone: e.target.value }))}
                    placeholder="+91-9876543210"
                    className={`pl-10 ${isReadOnly ? 'bg-muted/60 text-muted-foreground' : ''}`}
                    disabled={isReadOnly || isSubmitting}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio (optional)</Label>
              <Textarea
                id="bio"
                value={form.bio}
                onChange={(e) => setDraft((current) => ({ ...current, bio: e.target.value }))}
                placeholder="A short professional summary..."
                rows={4}
                disabled={isReadOnly || isSubmitting}
                className={isReadOnly ? 'bg-muted/60 text-muted-foreground' : undefined}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="linkedin_url">LinkedIn URL (optional)</Label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="linkedin_url"
                    value={form.linkedin_url}
                    onChange={(e) => setDraft((current) => ({ ...current, linkedin_url: e.target.value }))}
                    placeholder="https://linkedin.com/in/..."
                    className={`pl-10 ${isReadOnly ? 'bg-muted/60 text-muted-foreground' : ''}`}
                    disabled={isReadOnly || isSubmitting}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="portfolio_url">Portfolio URL (optional)</Label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="portfolio_url"
                    value={form.portfolio_url}
                    onChange={(e) => setDraft((current) => ({ ...current, portfolio_url: e.target.value }))}
                    placeholder="https://yoursite.dev"
                    className={`pl-10 ${isReadOnly ? 'bg-muted/60 text-muted-foreground' : ''}`}
                    disabled={isReadOnly || isSubmitting}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="photo_url">Photo URL (optional)</Label>
              <Input
                id="photo_url"
                value={form.photo_url}
                onChange={(e) => setDraft((current) => ({ ...current, photo_url: e.target.value }))}
                placeholder="https://cdn.example.com/photo.jpg"
                disabled={isReadOnly || isSubmitting}
                className={isReadOnly ? 'bg-muted/60 text-muted-foreground' : undefined}
              />
            </div>

            {(isCreateMode || isEditing) && (
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isSubmitting || !isFullNameValid}
                  className="bg-primary text-white hover:bg-primary-hover"
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  {isCreateMode ? 'Create Profile' : 'Save Changes'}
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

