'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import { StageId } from '@/types';
import { STAGES } from '@/lib/stages';
import { cn } from '@/lib/utils';

export interface FilterState {
  search: string;
  stages: StageId[];
  assignedTo: string;
}

export const DEFAULT_FILTERS: FilterState = {
  search: '',
  stages: [],
  assignedTo: '',
};

interface SearchFilterBarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  agents: string[];
}

export function SearchFilterBar({ filters, onChange, agents }: SearchFilterBarProps) {
  const [showFilters, setShowFilters] = useState(false);
  const activeCount = filters.stages.length + (filters.assignedTo ? 1 : 0);

  return (
    <div className="mb-4 space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            placeholder="Buscar por nombre, teléfono, email..."
            className={cn(
              'w-full rounded-xl bg-white/[0.03] border border-white/[0.06] pl-10 pr-4 py-2.5',
              'text-sm text-white placeholder:text-white/20 font-body',
              'focus:outline-none focus:border-neon-500/30 focus:ring-1 focus:ring-neon-500/15 transition-all'
            )}
          />
          {filters.search && (
            <button onClick={() => onChange({ ...filters, search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-medium transition-all',
            showFilters || activeCount > 0
              ? 'border-neon-500/30 bg-neon-500/10 text-neon-400'
              : 'border-white/[0.06] bg-white/[0.03] text-white/40 hover:text-white/60'
          )}
        >
          <Filter className="h-3.5 w-3.5" />
          Filtros
          {activeCount > 0 && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-neon-500 text-[9px] font-bold text-white">
              {activeCount}
            </span>
          )}
          <ChevronDown className={cn('h-3 w-3 transition-transform', showFilters && 'rotate-180')} />
        </button>

        {activeCount > 0 && (
          <button onClick={() => onChange(DEFAULT_FILTERS)}
            className="text-[11px] text-white/30 hover:text-white/50 transition-colors whitespace-nowrap">
            Limpiar
          </button>
        )}
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-4">
              <div>
                <label className="mb-2 block text-[10px] font-mono uppercase tracking-wider text-white/25">Etapas</label>
                <div className="flex flex-wrap gap-1.5">
                  {STAGES.map((stage) => {
                    const active = filters.stages.includes(stage.id);
                    return (
                      <button
                        key={stage.id}
                        onClick={() => {
                          const next = active
                            ? filters.stages.filter((s) => s !== stage.id)
                            : [...filters.stages, stage.id];
                          onChange({ ...filters, stages: next });
                        }}
                        className={cn(
                          'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium border transition-all',
                          active ? 'border-transparent text-white' : 'border-white/[0.06] bg-white/[0.02] text-white/35 hover:text-white/50'
                        )}
                        style={active ? { backgroundColor: `${stage.color}20`, color: stage.color, borderColor: `${stage.color}30` } : undefined}
                      >
                        <span>{stage.emoji}</span>{stage.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {agents.length > 0 && (
                <div>
                  <label className="mb-2 block text-[10px] font-mono uppercase tracking-wider text-white/25">Gestionado por</label>
                  <select
                    value={filters.assignedTo}
                    onChange={(e) => onChange({ ...filters, assignedTo: e.target.value })}
                    className="rounded-lg bg-white/[0.04] border border-white/[0.08] px-3 py-2 text-sm text-white font-body focus:outline-none focus:border-neon-500/30"
                  >
                    <option value="">Todos</option>
                    {agents.map((a) => (<option key={a} value={a}>{a}</option>))}
                  </select>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
