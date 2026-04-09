'use client';

import { useState, useMemo } from 'react';
import { useResumes, useUploadResume, useSetResumePrimary, useDeleteResume, useDownloadResume } from '@/lib/hooks/useCandidate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import EmptyState from '@/components/shared/EmptyState';
import ConfirmModal from '@/components/shared/ConfirmModal';
import Pagination from '@/components/shared/Pagination';
import { toast } from 'sonner';
import { Loader2, Plus, Star, Trash2, ExternalLink, FileText } from 'lucide-react';

/**
 * Manages candidate resumes including upload, primary selection, and deletion.
 */
export default function ResumesPage() {
  const [page, setPage] = useState(1);
  const params = useMemo(() => ({ page, limit: 10 }), [page]);
  const { data, loading, refetch } = useResumes(params);
  const { mutate: upload, loading: uploading } = useUploadResume();
  const { mutate: setPrimary, loading: settingPrimary } = useSetResumePrimary();
  const { mutate: deleteResume, loading: deleting } = useDeleteResume();
  const { mutate: downloadResume, loading: downloading } = useDownloadResume();

  const [showUpload, setShowUpload] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [uploadForm, setUploadForm] = useState({ title: '', file: null as File | null, is_primary: false });

  /**
   * Uploads a new resume and refreshes the resume list.
   */
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.file) {
      toast.error('Please choose a resume file');
      return;
    }
    try {
      await upload({
        file: uploadForm.file,
        title: uploadForm.title || undefined,
        is_primary: uploadForm.is_primary,
      });
      toast.success('Resume uploaded!');
      setShowUpload(false);
      setUploadForm({ title: '', file: null, is_primary: false });
      refetch();
    } catch {
      toast.error('Failed to upload resume');
    }
  };

  /**
   * Requests a signed URL for the resume and opens it in a new tab.
   */
  const handleDownload = async (resumeId: string) => {
    try {
      const signed = await downloadResume(resumeId);
      window.open(signed.download_url, '_blank', 'noopener,noreferrer');
    } catch {
      toast.error('Failed to open resume');
    }
  };

  /**
   * Marks a resume as the candidate's primary resume.
   */
  const handleSetPrimary = async (resumeId: string) => {
    try {
      await setPrimary(resumeId);
      toast.success('Primary resume updated');
      refetch();
    } catch {
      toast.error('Failed to set primary');
    }
  };

  /**
   * Deletes the selected resume and refreshes the list.
   */
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteResume(deleteTarget);
      toast.success('Resume deleted');
      setDeleteTarget(null);
      refetch();
    } catch {
      toast.error('Failed to delete resume. It may be linked to an application.');
    }
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Resumes</h1>
          <p className="mt-2 text-muted-foreground">Manage your resumes for job applications.</p>
        </div>
        <Button onClick={() => setShowUpload(true)} className="bg-linear-to-r from-violet-600 to-indigo-600 text-white">
          <Plus className="mr-2 h-4 w-4" />
          Upload Resume
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : data && data.data.length > 0 ? (
        <>
          <div className="space-y-3">
            {data.data.map((resume) => (
              <Card key={resume.id} className="border-border/40">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10">
                      <FileText className="h-5 w-5 text-violet-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{resume.title || 'Untitled Resume'}</p>
                        {resume.is_primary && (
                          <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                            <Star className="mr-1 h-3 w-3" />
                            Primary
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Uploaded {new Date(resume.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(resume.id)}
                      disabled={downloading}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    {!resume.is_primary && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSetPrimary(resume.id)}
                        disabled={settingPrimary}
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteTarget(resume.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {data.meta && <Pagination meta={data.meta} onPageChange={setPage} />}
        </>
      ) : (
        <EmptyState
          icon={FileText}
          title="No resumes yet"
          description="Upload your first resume to start applying for jobs."
          actionLabel="Upload Resume"
          onAction={() => setShowUpload(true)}
        />
      )}

      {/* Upload Dialog */}
      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Resume</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={uploadForm.title}
                onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                placeholder="e.g. Backend Resume 2025"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="resume-file">Resume File (PDF) *</Label>
              <Input
                id="resume-file"
                type="file"
                accept=".pdf,application/pdf"
                onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files?.[0] ?? null })}
                required
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_primary"
                checked={uploadForm.is_primary}
                onChange={(e) => setUploadForm({ ...uploadForm, is_primary: e.target.checked })}
                className="rounded border-input"
              />
              <Label htmlFor="is_primary" className="text-sm font-normal">
                Set as primary resume
              </Label>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={uploading}>
                {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Upload
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <ConfirmModal
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        title="Delete Resume"
        description="This cannot be undone. Resumes linked to applications cannot be deleted."
        confirmLabel="Delete"
        variant="destructive"
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
