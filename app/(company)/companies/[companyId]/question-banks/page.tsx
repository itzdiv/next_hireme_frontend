'use client';

import { use, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import EmptyState from '@/components/shared/EmptyState';
import { HelpCircle, ListChecks, Plus, Save, Sparkles, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCreateQuestionBank, useQuestionBanks, useUpdateQuestionBank } from '@/lib/hooks/useQuestionBanks';
import { Skeleton } from '@/components/ui/skeleton';
import Pagination from '@/components/shared/Pagination';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import type { CreateQuestionBankDto, Question, QuestionBank } from '@/types';

type QuestionDraft = {
  id: string;
  question: string;
  category: string;
  type: Question['type'];
  options: string[];
  is_required: boolean;
};

type EditorState = {
  mode: 'create' | 'edit';
  bankId: string | null;
  name: string;
  questions: QuestionDraft[];
};

const questionTypeOptions: Array<{ value: Question['type']; label: string }> = [
  { value: 'text', label: 'Long Text' },
  { value: 'number', label: 'Number' },
  { value: 'boolean', label: 'Yes / No' },
  { value: 'choice', label: 'Multiple Choice' },
];

function createQuestionId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `question-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

function createEmptyQuestion(): QuestionDraft {
  return {
    id: createQuestionId(),
    question: '',
    category: '',
    type: 'text',
    options: ['', ''],
    is_required: true,
  };
}

function createBlankEditorState(): EditorState {
  return {
    mode: 'create',
    bankId: null,
    name: '',
    questions: [createEmptyQuestion()],
  };
}

function toEditorState(bank: QuestionBank): EditorState {
  return {
    mode: 'edit',
    bankId: bank.id,
    name: bank.name,
    questions: bank.questions_json.map((question) => ({
      id: question.id,
      question: question.question,
      category: question.category ?? '',
      type: question.type,
      options: question.type === 'choice' ? question.options ?? ['', ''] : [],
      is_required: question.is_required ?? true,
    })),
  };
}

type BuildPayloadResult = CreateQuestionBankDto | null | 'INVALID_CHOICE_OPTIONS';
type BuiltQuestionPayload = {
  id: string;
  question: string;
  category?: string;
  type: Question['type'];
  options?: string[];
  is_required: boolean;
};

function buildPayload(editor: EditorState): BuildPayloadResult {
  const name = editor.name.trim();
  if (!name) {
    return null;
  }

  const questions: Array<BuiltQuestionPayload | null | false> = editor.questions
    .map((question) => {
      const prompt = question.question.trim();
      const category = question.category.trim();
      const options = question.options.map((option) => option.trim()).filter(Boolean);

      if (!prompt) {
        return null;
      }

      if (question.type === 'choice' && options.length < 2) {
        return false;
      }

      return {
        id: question.id,
        question: prompt,
        type: question.type,
        is_required: question.is_required,
        ...(category ? { category } : {}),
        ...(question.type === 'choice' ? { options } : {}),
      } satisfies BuiltQuestionPayload;
    });

  if (questions.some((question) => question === false)) {
    return 'INVALID_CHOICE_OPTIONS';
  }

  const normalizedQuestions = questions.filter(
    (question): question is BuiltQuestionPayload => question !== null && question !== false
  );

  if (normalizedQuestions.length === 0) {
    return null;
  }

  return {
    name,
    questions_json: normalizedQuestions,
  };
}

export default function QuestionBanksPage({ params }: { params: Promise<{ companyId: string }> }) {
  const { companyId } = use(params);
  const [page, setPage] = useState(1);
  const [editor, setEditor] = useState<EditorState>(createBlankEditorState);
  const [showSaveAsNew, setShowSaveAsNew] = useState(false);
  const [saveAsNewName, setSaveAsNewName] = useState('');
  const [saveAsNewError, setSaveAsNewError] = useState<string | null>(null);
  const [savingAsNew, setSavingAsNew] = useState(false);
  const queryParams = useMemo(() => ({ page, limit: 10 }), [page]);
  const { data, loading, error, refetch } = useQuestionBanks(companyId, queryParams);
  const { mutate: createQuestionBank, loading: creating } = useCreateQuestionBank();
  const { mutate: updateQuestionBank, loading: updating } = useUpdateQuestionBank();

  const saving = creating || updating;

  const getSaveLabel = () => {
    if (saving) return 'Saving...';
    if (editor.mode === 'edit') return 'Update Bank';
    return 'Save Bank';
  };

  const updateQuestion = (questionId: string, updater: (question: QuestionDraft) => QuestionDraft) => {
    setEditor((current) => ({
      ...current,
      questions: current.questions.map((question) =>
        question.id === questionId ? updater(question) : question
      ),
    }));
  };

  const handleSelectBank = (bank: QuestionBank) => {
    setEditor(toEditorState(bank));
    setShowSaveAsNew(false);
    setSaveAsNewError(null);
  };

  const handleCreateNew = () => {
    setEditor(createBlankEditorState());
    setShowSaveAsNew(false);
    setSaveAsNewError(null);
  };

  const handleOpenSaveAsNew = () => {
    const baseName = editor.name.trim() || 'Untitled Question Bank';
    setSaveAsNewName(`${baseName} (Copy)`);
    setSaveAsNewError(null);
    setShowSaveAsNew(true);
  };

  const handleSaveAsNew = async () => {
    const payload = buildPayload(editor);

    if (payload === null) {
      setSaveAsNewError('Add a template name and at least one valid question');
      return;
    }

    if (payload === 'INVALID_CHOICE_OPTIONS') {
      setSaveAsNewError('Choice questions need at least two options');
      return;
    }

    const trimmedName = saveAsNewName.trim();
    if (!trimmedName) {
      setSaveAsNewError('Please enter a name for the new question bank');
      return;
    }

    setSavingAsNew(true);
    setSaveAsNewError(null);

    try {
      await createQuestionBank(companyId, {
        name: trimmedName,
        questions_json: payload.questions_json,
      });
      toast.success(`New question bank '${trimmedName}' created successfully`);
      setShowSaveAsNew(false);
      refetch();
    } catch {
      setSaveAsNewError('Failed to create new question bank');
    } finally {
      setSavingAsNew(false);
    }
  };

  const handleSave = async () => {
    const payload = buildPayload(editor);

    if (payload === null) {
      toast.error('Add a template name and at least one valid question');
      return;
    }

    if (payload === 'INVALID_CHOICE_OPTIONS') {
      toast.error('Choice questions need at least two options');
      return;
    }

    try {
      if (editor.mode === 'edit' && editor.bankId) {
        await updateQuestionBank(companyId, editor.bankId, payload);
        toast.success('Question bank updated');
      } else {
        await createQuestionBank(companyId, payload);
        toast.success('Question bank created');
      }

      refetch();
      handleCreateNew();
    } catch {
      toast.error('Failed to save question bank');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Question Banks</h1>
          <p className="mt-2 text-muted-foreground">Create reusable screening templates and attach them to questionnaire-based jobs.</p>
        </div>
        <Button onClick={handleCreateNew} className="btn-gradient">
          <Plus className="mr-2 h-4 w-4" />
          Create Question Bank
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
        <div className="space-y-6">
          <Card className="border-border/40">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600">
                  <ListChecks className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>Template Library</CardTitle>
                  <CardDescription>Recruiters can reuse these banks across roles without rebuilding every screening flow.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-44 rounded-xl" />
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
                  <div className="grid gap-4 md:grid-cols-2">
                    {data.data.map((questionBank) => {
                      const isSelected = editor.bankId === questionBank.id && editor.mode === 'edit';

                      return (
                        <button
                          key={questionBank.id}
                          type="button"
                          onClick={() => handleSelectBank(questionBank)}
                          className={`min-h-9 w-full rounded-xl text-left focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 ${isSelected ? '' : ''}`}
                        >
                          <Card className={`h-full border-border/40 transition-all ${isSelected ? 'border-blue-500/60 ring-2 ring-blue-500/15' : 'card-hover'}`}>
                            <CardContent className="flex h-full flex-col p-5">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-lg font-semibold leading-tight">{questionBank.name}</p>
                                  <p className="mt-1 text-sm text-muted-foreground">
                                    {questionBank.questions_json.length} question{questionBank.questions_json.length === 1 ? '' : 's'}
                                  </p>
                                </div>
                                {isSelected ? <Badge className="badge-owner">Editing</Badge> : <Badge variant="outline">Template</Badge>}
                              </div>

                              <div className="mt-4 flex flex-wrap gap-2">
                                {questionBank.questions_json.slice(0, 4).map((question) => (
                                  <Badge key={question.id} variant="secondary" className="font-normal capitalize">
                                    {question.type}
                                  </Badge>
                                ))}
                              </div>

                              <div className="mt-5 rounded-xl border border-border/40 bg-muted/20 p-4 text-sm text-muted-foreground">
                                {questionBank.questions_json[0]?.question ?? 'No questions yet'}
                              </div>
                            </CardContent>
                          </Card>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-4">
                    <Pagination meta={data.meta} onPageChange={setPage} />
                  </div>
                </>
              ) : (
                <EmptyState
                  icon={HelpCircle}
                  title="No question banks yet"
                  description="No question banks yet. Create one to use screening questions in your jobs."
                  actionLabel="Create Question Bank"
                  onAction={handleCreateNew}
                />
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/40 xl:sticky xl:top-24 xl:self-start">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>{editor.mode === 'edit' ? 'Edit Question Bank' : 'Build New Question Bank'}</CardTitle>
                <CardDescription>Design the screening form recruiters will attach to questionnaire-based job posts.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {editor.mode === 'edit' ? (
              <div className="rounded-xl border border-amber-300/50 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
                Note: Changes here will only apply to future jobs. Existing jobs that used this bank are not affected.
              </div>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="question-bank-name">Template Name</Label>
              <Input
                id="question-bank-name"
                value={editor.name}
                onChange={(event) => setEditor((current) => ({ ...current, name: event.target.value }))}
                placeholder="Backend Screening v1"
                className="h-12 bg-muted/40"
              />
            </div>

            <div className="max-h-105 overflow-y-auto pr-2 flex flex-col gap-4">
              {editor.questions.map((question, index) => (
                <div key={question.id} className="rounded-2xl border border-border/40 bg-muted/20 p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">Question {index + 1}</p>
                      <p className="text-xs text-muted-foreground">Define prompt, answer type, and requirement level.</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      disabled={editor.questions.length === 1}
                      onClick={() => setEditor((current) => ({
                        ...current,
                        questions: current.questions.filter((item) => item.id !== question.id),
                      }))}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Prompt</Label>
                      <Textarea
                        value={question.question}
                        onChange={(event) => updateQuestion(question.id, (current) => ({ ...current, question: event.target.value }))}
                        rows={3}
                        placeholder="What are you looking for from the candidate?"
                        className="bg-background"
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Input
                          value={question.category}
                          onChange={(event) => updateQuestion(question.id, (current) => ({ ...current, category: event.target.value }))}
                          placeholder="e.g. technical, culture, experience"
                          className="h-11 bg-background"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Answer Type</Label>
                        <Select
                          value={question.type}
                          onValueChange={(value) => updateQuestion(question.id, (current) => {
                            const nextType = value as Question['type'];

                            if (nextType !== 'choice') {
                              return {
                                ...current,
                                type: nextType,
                                options: [],
                              };
                            }

                            if (current.options.length > 0) {
                              return {
                                ...current,
                                type: nextType,
                              };
                            }

                            return {
                              ...current,
                              type: nextType,
                              options: ['', ''],
                            };
                          })}
                        >
                          <SelectTrigger className="h-11 bg-background">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {questionTypeOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <label className="flex items-center gap-3 rounded-xl border border-border/40 bg-background px-3 py-2.5 text-sm">
                      <input
                        type="checkbox"
                        checked={question.is_required}
                        onChange={(event) => updateQuestion(question.id, (current) => ({ ...current, is_required: event.target.checked }))}
                        className="rounded border-input"
                      />
                      Candidate must answer this question
                    </label>

                    {question.type === 'choice' ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label>Options</Label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => updateQuestion(question.id, (current) => ({
                              ...current,
                              options: [...current.options, ''],
                            }))}
                          >
                            <Plus className="mr-1 h-3.5 w-3.5" />
                            Add Option
                          </Button>
                        </div>

                        <div className="space-y-2">
                          {question.options.map((option, optionIndex) => (
                            <div key={`${question.id}-${optionIndex}`} className="flex items-center gap-2">
                              <Input
                                value={option}
                                onChange={(event) => updateQuestion(question.id, (current) => ({
                                  ...current,
                                  options: current.options.map((currentOption, currentIndex) =>
                                    currentIndex === optionIndex ? event.target.value : currentOption
                                  ),
                                }))}
                                placeholder={`Option ${optionIndex + 1}`}
                                className="h-10 bg-background"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                disabled={question.options.length <= 2}
                                onClick={() => updateQuestion(question.id, (current) => ({
                                  ...current,
                                  options: current.options.filter((_, currentIndex) => currentIndex !== optionIndex),
                                }))}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full border-dashed"
              onClick={() => setEditor((current) => ({
                ...current,
                questions: [...current.questions, createEmptyQuestion()],
              }))}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Question
            </Button>

            {editor.mode === 'edit' && showSaveAsNew ? (
              <div className="rounded-xl border border-border/40 bg-muted/20 p-4 space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="save-as-new-name">New Question Bank Name</Label>
                  <Input
                    id="save-as-new-name"
                    value={saveAsNewName}
                    onChange={(event) => {
                      setSaveAsNewName(event.target.value);
                      setSaveAsNewError(null);
                    }}
                    placeholder="Question Bank Name (Copy)"
                    className="h-11 bg-background"
                  />
                </div>
                {saveAsNewError ? <p className="text-xs text-destructive">{saveAsNewError}</p> : null}
                <div className="flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowSaveAsNew(false);
                      setSaveAsNewError(null);
                    }}
                    disabled={savingAsNew}
                  >
                    Cancel
                  </Button>
                  <Button type="button" className="btn-gradient" onClick={handleSaveAsNew} disabled={savingAsNew}>
                    {savingAsNew ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Create New Bank
                  </Button>
                </div>
              </div>
            ) : null}

            <div className="flex items-center justify-end gap-3 border-t border-border/40 pt-4">
              <Button type="button" variant="outline" onClick={handleCreateNew} disabled={saving}>
                Reset
              </Button>
              {editor.mode === 'edit' ? (
                <Button type="button" variant="outline" onClick={handleOpenSaveAsNew} disabled={saving || savingAsNew}>
                  Save as New Question Bank
                </Button>
              ) : null}
              <Button type="button" className="btn-gradient min-w-36" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {getSaveLabel()}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


