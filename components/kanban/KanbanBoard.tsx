'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  DndContext, DragEndEvent, DragOverlay, DragStartEvent,
  PointerSensor, useSensor, useSensors, closestCorners,
} from '@dnd-kit/core';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ArrowLeft } from 'lucide-react';
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

  // Estado para controlar si estamos viendo el dashboard de estados en móvil
  const [showMobileGrid, setShowMobileGrid] = useState(true);

  const handleStageSelect = (stageId: StageId) => {
    setActiveStageId(stageId);
    setShowMobileGrid(false);
  };

  return (
    <>
      {/* Mobile Stages Grid (Dashboard) */}
      <AnimatePresence mode="wait">
        {showMobileGrid ? (
          <motion.div 
            key="mobile-grid"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="sm:hidden grid grid-cols-2 gap-3 mb-6 px-1"
          >
            {STAGES.map((s) => (
              <button
                key={s.id}
                onClick={() => handleStageSelect(s.id)}
                className="flex flex-col items-center justify-center gap-3 p-5 rounded-[2rem] border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all relative overflow-hidden group active:scale-95"
              >
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                   <ChevronRight className="h-4 w-4" />
                </div>
                <div 
                  className="flex h-12 w-12 items-center justify-center rounded-2xl text-xl shadow-lg"
                  style={{ backgroundColor: `${s.color}15`, color: s.color, border: `1px solid ${s.color}20` }}
                >
                  {s.emoji}
                </div>
                <div className="text-center">
                  <h4 className="text-[11px] font-black uppercase tracking-[0.15em] text-text-primary mb-1">{s.label}</h4>
                  <p className="text-[10px] font-mono font-bold" style={{ color: s.color }}>
                    {leadsByStage[s.id].length} {leadsByStage[s.id].length === 1 ? 'LEAD' : 'LEADS'}
                  </p>
                </div>
                {/* Visual glow indicator */}
                <div 
                  className="absolute bottom-0 inset-x-0 h-1 opacity-20"
                  style={{ background: `linear-gradient(90deg, transparent, ${s.color}, transparent)` }}
                />
              </button>
            ))}
          </motion.div>
        ) : (
          /* Mobile Column Selection Header */
          <div className="sm:hidden mb-4 flex items-center gap-3">
            <button
              onClick={() => setShowMobileGrid(true)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border-subtle bg-bg-primary/20 text-text-muted hover:text-text-primary transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-text-primary flex items-center gap-2">
                <span>{STAGES.find(s => s.id === activeStageId)?.emoji}</span>
                {activeStageId}
              </h3>
              <p className="text-[10px] text-text-muted font-body">
                Listado de leads en esta etapa
              </p>
            </div>
            <div className="ml-auto flex gap-1 overflow-x-auto no-scrollbar max-w-[120px]">
               {STAGES.filter(s => s.id !== activeStageId).map(s => (
                 <button 
                  key={s.id}
                  onClick={() => setActiveStageId(s.id)}
                  className="h-8 w-8 flex-shrink-0 flex items-center justify-center rounded-lg border border-white/5 bg-white/[0.02] text-xs grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all"
                 >
                   {s.emoji}
                 </button>
               ))}
            </div>
          </div>
        )
      }
      </AnimatePresence>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-8 no-scrollbar min-h-[75vh] items-start">
          {STAGES.map((stage, index) => (
            <div
              key={stage.id}
              className={cn(
                'flex-shrink-0 transition-all duration-300', 
                activeStageId === stage.id ? 'block w-full sm:w-[305px] lg:w-[320px]' : 'hidden sm:block sm:w-[305px] lg:w-[320px]'
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
