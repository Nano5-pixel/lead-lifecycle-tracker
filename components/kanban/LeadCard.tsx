'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import {
  MessageCircle, Phone, GripVertical, User,
  CheckCircle2, FileCheck, Clock, AlertTriangle,
} from 'lucide-react';
import { Lead } from '@/types';
import { cn, formatDate, whatsappLink, phoneLink } from '@/lib/utils';
import { STAGE_MAP } from '@/lib/stages';

interface LeadCardProps {
  lead: Lead;
  isDragging?: boolean;
  onSelect?: (lead: Lead) => void;
}

export function LeadCard({ lead, isDragging, onSelect }: LeadCardProps) {
  const {
    attributes, listeners, setNodeRef, transform, transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: lead.id, data: { lead } });

  const style = { transform: CSS.Transform.toString(transform), transition };
  const stage = STAGE_MAP[lead.etapa];
  const dragging = isDragging || isSortableDragging;

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <motion.div
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => onSelect?.(lead)}
        className={cn(
          'group relative rounded-xl border bg-white/[0.03] backdrop-blur-md',
          'transition-all duration-300 cursor-grab active:cursor-grabbing',
          dragging
            ? 'border-neon-500/40 bg-neon-500/[0.06] shadow-neon scale-[1.02] z-50'
            : 'border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.05]'
        )}
      >
        <div className="flex items-start gap-2 p-3 pb-2">
          <button {...listeners} className="mt-0.5 flex-shrink-0 text-white/20 hover:text-white/40 transition-colors">
            <GripVertical className="h-4 w-4" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/[0.06]">
                <User className="h-3 w-3 text-white/50" />
              </div>
              <h4 className="text-[13px] font-display font-semibold text-white truncate">
                {lead.nombre || 'Sin nombre'}
              </h4>
            </div>
            <div className="mt-1.5 flex items-center gap-3 text-[11px] text-white/35 font-body">
              {lead.fuente && <span className="truncate max-w-[100px]">{lead.fuente}</span>}
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />{formatDate(lead.fechaEntrada)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 pb-2 flex-wrap">
          {lead.diasEnEtapa > 0 && (
            <span className={cn(
              'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-mono font-semibold',
              lead.diasEnEtapa >= 7
                ? 'bg-red-500/10 border-red-500/15 text-red-400'
                : 'bg-amber-500/10 border-amber-500/15 text-amber-400'
            )}>
              <Clock className="h-3 w-3" />{lead.diasEnEtapa}d
              {lead.diasEnEtapa >= 7 && <AlertTriangle className="h-3 w-3" />}
            </span>
          )}
          {lead.preCalificado && (
            <span className="inline-flex items-center gap-1 rounded-md bg-violet-500/10 border border-violet-500/15 px-2 py-0.5 text-[10px] font-medium text-violet-400">
              <CheckCircle2 className="h-3 w-3" />Pre-Cal
            </span>
          )}
          {lead.contratoFirmado && (
            <span className="inline-flex items-center gap-1 rounded-md bg-cyan-500/10 border border-cyan-500/15 px-2 py-0.5 text-[10px] font-medium text-cyan-400">
              <FileCheck className="h-3 w-3" />Contrato
            </span>
          )}
        </div>

        {lead.notas && (
          <div className="mx-3 mb-2 rounded-lg bg-white/[0.02] border border-white/[0.04] px-2.5 py-1.5">
            <p className="text-[11px] text-white/30 leading-relaxed line-clamp-2 font-body">{lead.notas}</p>
          </div>
        )}

        {lead.etapa === 'Perdido' && lead.motivoCaida && (
          <div className="mx-3 mb-2 rounded-lg bg-red-500/[0.04] border border-red-500/[0.08] px-2.5 py-1.5">
            <p className="text-[10px] text-red-400/70 leading-relaxed font-body">
              {lead.motivoCaida}
            </p>
          </div>
        )}

        <div className="flex items-center gap-1.5 border-t border-white/[0.04] px-3 py-2">
          {lead.telefono && (
            <>
              <a href={whatsappLink(lead.telefono)} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/15 px-2.5 py-1.5 text-[10px] font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                onClick={(e) => e.stopPropagation()}>
                <MessageCircle className="h-3 w-3" />WhatsApp
              </a>
              <a href={phoneLink(lead.telefono)}
                className="flex items-center gap-1.5 rounded-lg bg-neon-500/10 border border-neon-500/15 px-2.5 py-1.5 text-[10px] font-semibold text-neon-400 hover:bg-neon-500/20 transition-colors"
                onClick={(e) => e.stopPropagation()}>
                <Phone className="h-3 w-3" />Llamar
              </a>
            </>
          )}
          {lead.gestionadoPor && (
            <span className="ml-auto text-[10px] text-white/25 font-body truncate max-w-[80px]">
              @{lead.gestionadoPor}
            </span>
          )}
        </div>

        <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full"
          style={{ backgroundColor: stage?.color || '#555' }} />
      </motion.div>
    </div>
  );
}
