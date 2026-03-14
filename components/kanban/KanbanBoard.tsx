'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  DndContext, DragEndEvent, DragOverlay, DragStartEvent,
  PointerSensor, useSensor, useSensors, closestCorners,
} from '@dnd-kit/core';
import { Lead, StageId } from '@/types';
import { STAGES } from '@/lib/stages';
import { KanbanColumn } from './KanbanColumn';
import { LeadCard } from './LeadCard';
import { RuleViolationModal } from '../ui/RuleViolationModal';
import { useToast } from '../ui/Toast';

interface KanbanBoardProps {
  leads: Lead[];
  onMoveLeadToStage: (lead: Lead, toStage: StageId) => Promise<{ success: boolean; error?: string }>;
  onSelectLead?: (lead: Lead) => void;
}

export function KanbanBoard({ leads, onMoveLeadToStage, onSelectLead }: KanbanBoardProps) {
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
    for (const lead of leads) {
      if (grouped[lead.etapa]) grouped[lead.etapa].push(lead);
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

    const targetStageId = (over.data?.current?.stage?.id || over.id) as StageId;
    if (lead.etapa === targetStageId) return;

    const result = await onMoveLeadToStage(lead, targetStageId);
    if (!result.success) {
      setRuleModal({
        open: true,
        message: result.error || 'Transición no permitida.',
        ruleId: result.error?.includes('RULE-07') ? 'RULE-07' : undefined,
      });
    } else {
      toast(`${lead.nombre} movido a ${targetStageId}`, 'success');
    }
  }, [leads, onMoveLeadToStage, toast]);

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-3 overflow-x-auto pb-4 lg:gap-4">
          {STAGES.map((stage, index) => (
            <KanbanColumn
              key={stage.id}
              stage={stage}
              leads={leadsByStage[stage.id] || []}
              index={index}
              onSelectLead={onSelectLead}
            />
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
