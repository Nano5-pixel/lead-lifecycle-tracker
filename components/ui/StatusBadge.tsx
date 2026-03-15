'use client';

import { cn } from '@/lib/utils';
import { STAGE_MAP } from '@/lib/stages';
import { StageId } from '@/types';

interface StatusBadgeProps {
  stageId: StageId;
  size?: 'sm' | 'md';
}

export function StatusBadge({ stageId, size = 'sm' }: StatusBadgeProps) {
  const stage = STAGE_MAP[stageId];
  if (!stage) return null;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium border border-text-primary/10',
        size === 'sm' && 'px-2.5 py-0.5 text-[11px]',
        size === 'md' && 'px-3 py-1 text-xs'
      )}
      style={{ backgroundColor: `${stage.color}20`, color: stage.color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: stage.color }} />
      {stage.label}
    </span>
  );
}
