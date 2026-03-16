'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { Question } from '@/types';

interface ScreeningQuestionsFormProps {
  questions: Question[] | null;
  answers: Record<string, unknown>;
  onChange: (questionId: string, value: unknown) => void;
}

interface QuestionInputProps {
  question: Question;
  value: unknown;
  onChange: (value: unknown) => void;
}

function QuestionInput({ question, value, onChange }: QuestionInputProps) {
  const isRequired = question.is_required !== false;

  return (
    <div className="flex flex-col gap-2">
      <Label className="text-sm font-medium">
        {question.question}
        {isRequired ? (
          <span className="ml-1 text-destructive">*</span>
        ) : (
          <span className="ml-1 font-normal text-muted-foreground">(optional)</span>
        )}
      </Label>

      {question.type === 'text' ? (
        <Textarea
          rows={4}
          className="resize-y"
          value={String(value ?? '')}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Your answer..."
        />
      ) : null}

      {question.type === 'number' ? (
        <Input
          type="number"
          value={value === undefined || value === null ? '' : String(value)}
          onChange={(event) => onChange(event.target.value === '' ? undefined : event.target.valueAsNumber)}
          placeholder="Enter a number..."
        />
      ) : null}

      {question.type === 'boolean' ? (
        <select
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
          value={value === undefined ? '' : String(value)}
          onChange={(event) => {
            if (event.target.value === '') {
              onChange(undefined);
              return;
            }
            onChange(event.target.value === 'true');
          }}
        >
          <option value="">Select an answer</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      ) : null}

      {question.type === 'choice' ? (
        <div className="flex flex-wrap gap-2">
          {(question.options ?? []).map((option) => {
            const isSelected = value === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => onChange(option)}
                className={cn(
                  'rounded-lg border px-4 py-2 text-sm font-medium transition-all',
                  isSelected
                    ? 'border-[#BFDBFE] bg-[#EFF6FF] text-[#1E40AF] ring-1 ring-[#BFDBFE]'
                    : 'border-border hover:border-[#BFDBFE] hover:bg-muted/40',
                )}
              >
                {option}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export function ScreeningQuestionsForm({ questions, answers, onChange }: ScreeningQuestionsFormProps) {
  if (!questions) {
    return (
      <p className="text-sm text-muted-foreground">Loading questions...</p>
    );
  }

  if (questions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No screening questions for this job.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {questions.map((question) => (
        <QuestionInput
          key={question.id}
          question={question}
          value={answers[question.id]}
          onChange={(value) => onChange(question.id, value)}
        />
      ))}
    </div>
  );
}


