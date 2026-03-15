'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  DndContext, DragEndEvent, DragOverlay, DragStartEvent,
  PointerSensor, useSensor, useSensors, closestCorners,
} from '@dnd-kit/core';
import { Lead, StageId } from '@/types';
import { STAGES, VALID_STAGES } from '@/lib/stages';
import { KanbanColumn } from './KanbanColumn';
import { LeadCard } from './LeadCard';
import { cn } from '@/lib/utils';
import { RuleViolationModal } from '../ui/RuleViolationModal';
import { useToast } from '../ui/Toast';

interface KanbanBoardProps {
  leads: Lead[];
  onMoveLeadToStage: (lead: Lead, toStage: StageId) => Promise<{ success: boolean; error?: string }>;
  onSelectLead?: (lead: Lead) => void;
}

export function KanbanBoard({ leads, onMoveLeadToStage, onSelectLead }: KanbanBoardProps) {
  const [activeStageId, setActiveStageId] = useState<StageId>(STAGES[0].id);
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [ruleModal, setRuleModal] = useState<{ open: boolean; message: string; ruleId?: string }>({
    open: false, message: '',
  });
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const leadsByStage = useMemo(() => {
    const grouped: Record<StageId, Lead[]> = {
      'Nuevo': [], 'En Contacto': [], 'Calificado': [],
      'Propuesta': [], 'Ganado': [], 'Perdido': [],
    };
    
    const validIds = STAGES.map(s => s.id);

    for (const lead of leads) {
      // Normalize stage string: trim whitespace
      const rawEtapa = (lead.etapa || '').toString().trim();
      
      // Find matching stage ID (case-insensitive fallback)
      let stageId: StageId = 'Nuevo';
      
      const exactMatch = validIds.find(id => id === rawEtapa);
      if (exactMatch) {
        stageId = exactMatch as StageId;
      } else {
        const caseInsensitiveMatch = validIds.find(id => id.toLowerCase() === rawEtapa.toLowerCase());
        if (caseInsensitiveMatch) {
          stageId = caseInsensitiveMatch as StageId;
        }
      }
      
      grouped[stageId].push(lead);
    }
    return grouped;
  }, [leads]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const lead = leads.find((l) => l.id === event.active.id);
    setActiveLead(lead || null);
  }, [leads]);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveLead(null);
    if (!over) return;

    const lead = leads.find((l) => l.id === active.id);
    if (!lead) return;

    const targetStageId = (over.data?.current?.stage?.id || over.data?.current?.stageId || over.id) as StageId;
    
    if (!VALID_STAGES.includes(targetStageId)) return;
    if (lead.etapa === targetStageId) return;

    const result = await onMoveLeadToStage(lead, targetStageId);
    if (!result.success) {
      setRuleModal({
        open: true,
        message: result.error || 'Transición no permitida.',
      });
    } else {
      toast(`${lead.nombre} movido a ${targetStageId}`, 'success');
    }
  }, [leads, onMoveLeadToStage, toast]);

  return (
    <>
      {/* Mobile Stage Switcher */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2 sm:hidden no-scrollbar px-1">
        {STAGES.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveStageId(s.id)}
            className={cn(
              'flex flex-shrink-0 items-center gap-2 rounded-full px-4 py-2 text-[11px] font-bold transition-all duration-300 border',
              activeStageId === s.id
                ? 'border-neon-500/50 bg-neon-500/10 text-neon-400 shadow-[0_0_15px_rgba(10,132,255,0.15)] scale-105'
                : 'border-border-subtle bg-bg-primary/30 text-text-muted hover:text-text-secondary'
            )}
          >
            <span className="text-sm">{s.emoji}</span>
            <span className="uppercase tracking-wider">{s.label}</span>
            <span className={cn(
              "ml-1 flex h-4 min-w-[18px] items-center justify-center rounded-full px-1.5 text-[9px] font-mono",
              activeStageId === s.id ? "bg-neon-500 text-white" : "bg-border-subtle text-text-muted"
            )}>
              {leadsByStage[s.id].length}
            </span>
          </button>
        ))}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-3 overflow-x-auto pb-4 lg:gap-4 no-scrollbar">
          {STAGES.map((stage, index) => (
            <div
              key={stage.id}
              className={cn(
                'flex-shrink-0',
                activeStageId === stage.id ? 'block w-full sm:w-auto' : 'hidden sm:block'
              )}
            >
              <KanbanColumn
                stage={stage}
                leads={leadsByStage[stage.id] || []}
                index={index}
                onSelectLead={onSelectLead}
                onMoveLead={onMoveLeadToStage}
              />
            </div>
          ))}
        </div>
        <DragOverlay>
          {activeLead ? (
            <div className="w-[280px]">
              <LeadCard lead={activeLead} isDragging />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
      <RuleViolationModal
        open={ruleModal.open}
        onClose={() => setRuleModal({ open: false, message: '' })}
        message={ruleModal.message}
        ruleId={ruleModal.ruleId}
      />
    </>
  );
}
