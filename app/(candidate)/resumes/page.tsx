'use client';

import { useState, useMemo } from 'react';
import { useResumes, useUploadResume, useSetResumePrimary, useDeleteResume, useDownloadResume } from '@/lib/hooks/useCandidate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import EmptyState from '@/components/shared/EmptyState';
import ConfirmModal from '@/components/shared/ConfirmModal';
import Pagination from '@/components/shared/Pagination';
import { toast } from 'sonner';
import { Loader2, Plus, Star, Trash2, ExternalLink, FileText } from 'lucide-react';
import { getApiErrorMessage } from '@/lib/utils';

/**
 * Manages candidate resumes including upload, primary selection, and deletion.
 */
export default function ResumesPage() {
  const [page, setPage] = useState(1);
  const params = useMemo(() => ({ page, limit: 10 }), [page]);
  const { data, loading, error, refetch } = useResumes(params);
  const { mutate: upload, loading: uploading } = useUploadResume();
  const { mutate: setPrimary, loading: settingPrimary } = useSetResumePrimary();
  const { mutate: deleteResume, loading: deleting } = useDeleteResume();
  const { mutate: downloadResume, loading: downloading } = useDownloadResume();

  const [showUpload, setShowUpload] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [uploadForm, setUploadForm] = useState({ title: '', file: null as File | null, is_primary: false });

  const formatBytes = (bytes?: number) => {
    if (!bytes || Number.isNaN(bytes)) return 'Unknown size';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileName = (fileUrl?: string | null, explicitName?: string | null) => {
    if (explicitName?.trim()) return explicitName;
    if (!fileUrl?.trim()) return 'resume.pdf';
    try {
      const path = new URL(fileUrl).pathname;
      const lastSegment = path.split('/').pop();
      return lastSegment || 'resume.pdf';
    } catch {
      return fileUrl.split('/').pop() || 'resume.pdf';
    }
  };

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
    } catch (error: unknown) {
      const status = (error as { response?: { status?: number } }).response?.status;
      if (status === 409) {
        toast.error('This resume is attached to one or more applications and cannot be deleted');
        return;
      }
      toast.error(getApiErrorMessage(error, 'Failed to delete resume'));
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Resumes</h1>
          <p className="mt-2 text-muted-foreground">Manage your resumes for job applications.</p>
        </div>
        <Button onClick={() => setShowUpload(true)} className="bg-primary text-white shadow-lg shadow-blue-500/20 hover:bg-primary-hover">
          <Plus className="mr-2 h-4 w-4" />
          Upload Resume
        </Button>
      </div>

      <div className="mt-6 flex flex-1 flex-col">
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
          <p className="text-sm font-medium text-destructive">Something went wrong loading this page. Please try again.</p>
          <Button variant="outline" className="mt-4" onClick={refetch}>
            Retry
          </Button>
        </div>
      ) : data && data.data.length > 0 ? (
        <>
          <div className="space-y-3">
            {data.data.map((resume) => {
              const shouldShowPrimary = resume.is_primary || data.data.length === 1;
              const canDelete = !resume.is_used_in_applications;
              return (
                <Card key={resume.id} className="border-border/40">
                  <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                        <FileText className="h-5 w-5 text-blue-500" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium">{resume.title || 'Untitled Resume'}</p>
                          {shouldShowPrimary && (
                            <Badge className="border-amber-200 bg-amber-50 text-amber-700">
                              <Star className="mr-1 h-3 w-3 fill-amber-500 text-amber-500" />
                              Primary
                            </Badge>
                          )}
                        </div>
                        <p className="break-all text-sm text-muted-foreground">
                          {getFileName(resume.file_url, resume.file_name)}  {formatBytes(resume.file_size_bytes)} Uploaded {new Date(resume.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(resume.id)}
                        disabled={downloading}
                      >
                        {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
                      </Button>
                      {!shouldShowPrimary && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSetPrimary(resume.id)}
                          disabled={settingPrimary}
                        >
                          {settingPrimary ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                          Set as Primary
                        </Button>
                      )}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger render={<span className="inline-flex" />}>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteTarget(resume.id)}
                              disabled={!canDelete}
                              className="text-destructive hover:text-destructive disabled:opacity-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          {!canDelete ? (
                            <TooltipContent>
                              This resume is attached to one or more applications and cannot be deleted
                            </TooltipContent>
                          ) : null}
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          {data.meta && <Pagination meta={data.meta} onPageChange={setPage} />}
        </>
      ) : (
        <div className="flex flex-1 items-center justify-center">
          <EmptyState
            icon={FileText}
            title="No resumes uploaded"
            description="No resumes uploaded. Upload your first resume to start applying."
            actionLabel="Upload Resume"
            onAction={() => setShowUpload(true)}
          />
        </div>
      )}
      </div>

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


