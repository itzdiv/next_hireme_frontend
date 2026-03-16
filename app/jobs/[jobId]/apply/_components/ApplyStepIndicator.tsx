'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ApplyFlowStep } from './useApplyToJobFlow';

type Step = 1 | 2 | 3 | 4;

interface ApplyStepIndicatorProps {
  step: Step;
  steps: ApplyFlowStep[];
  onStepClick: (step: Step) => void;
}

export function ApplyStepIndicator({ step, steps, onStepClick }: ApplyStepIndicatorProps) {
  return (
    <div className="mt-6 mb-8 flex items-center justify-center">
      {steps.map((s, index) => {
        const isComplete = step > s.number;
        const isCurrent = step === s.number;
        const isClickable = isComplete;

        return (
          <div key={s.number} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <button
                type="button"
                onClick={() => { if (isClickable) onStepClick(s.number); }}
                disabled={!isClickable}
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-all',
                  isComplete && 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer',
                  isCurrent && 'bg-blue-600 text-white ring-4 ring-blue-600/20 cursor-default',
                  !isComplete && !isCurrent && 'bg-muted text-muted-foreground cursor-default',
                )}
              >
                {isComplete ? <Check className="h-4 w-4" /> : s.number}
              </button>
              <span
                className={cn(
                  'hidden text-xs font-medium sm:block',
                  isCurrent && 'text-foreground',
                  isComplete && 'text-blue-600',
                  !isComplete && !isCurrent && 'text-muted-foreground',
                )}
              >
                {s.label}
              </span>
            </div>

            {index < steps.length - 1 && (
              <div
                className={cn(
                  'mx-3 mb-5 h-px w-16 sm:w-24 transition-colors',
                  isComplete ? 'bg-blue-600' : 'bg-border',
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

