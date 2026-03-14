'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { motion } from 'framer-motion';
import { Lead, Stage } from '@/types';
import { LeadCard } from './LeadCard';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  stage: Stage;
  leads: Lead[];
  index: number;
  onSelectLead?: (lead: Lead) => void;
}

export function KanbanColumn({ stage, leads, index, onSelectLead }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id, data: { stage } });
  const leadIds = leads.map((l) => l.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex h-full w-[300px] flex-shrink-0 flex-col lg:w-auto lg:flex-1"
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-base">{stage.emoji}</span>
          <h3 className="text-[13px] font-display font-semibold text-white/80">{stage.label}</h3>
        </div>
        <span
          className="flex h-6 min-w-[24px] items-center justify-center rounded-lg px-2 text-[11px] font-mono font-bold"
          style={{ backgroundColor: `${stage.color}15`, color: stage.color }}
        >
          {leads.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 rounded-2xl border-2 border-dashed p-2 transition-all duration-300 overflow-y-auto',
          isOver ? 'border-neon-500/40 bg-neon-500/[0.04]' : 'border-transparent bg-white/[0.01]'
        )}
        style={{ minHeight: '200px' }}
      >
        <SortableContext items={leadIds} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2">
            {leads.map((lead) => (
              <LeadCard key={lead.id} lead={lead} onSelect={onSelectLead} />
            ))}
          </div>
        </SortableContext>
        {leads.length === 0 && (
          <div className="flex h-32 items-center justify-center">
            <p className="text-[11px] text-white/15 font-body">Arrastra leads aquí</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
