'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { StatsOverview } from '@/components/stats/StatsOverview';
import { NewLeadModal } from '@/components/kanban/NewLeadModal';
import { LeadDetailPanel } from '@/components/kanban/LeadDetailPanel';
import { SearchFilterBar, FilterState, DEFAULT_FILTERS } from '@/components/kanban/SearchFilterBar';
import { useToast } from '@/components/ui/Toast';
import { useLeadsForClient } from '@/hooks/useLeads';
import { Cliente, Lead, StageId } from '@/types';
import { validateStageTransition } from '@/lib/rules';
import { doc, updateDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type ViewMode = 'kanban' | 'stats';

interface AgenciaLeadsViewProps {
  agenciaId: string;
  cliente: Cliente;
  onBack: () => void;
  view: ViewMode;
}

export function AgenciaLeadsView({ agenciaId, cliente, onBack, view }: AgenciaLeadsViewProps) {
  const [showNewLead, setShowNewLead] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const { leads, loading } = useLeadsForClient(agenciaId, cliente.id);
  const { toast } = useToast();

  const basePath = `agencias/${agenciaId}/clientes/${cliente.id}/leads`;

  const agents = useMemo(() => {
    const set = new Set<string>();
    leads.forEach((l) => l.gestionadoPor && set.add(l.gestionadoPor));
    return Array.from(set).sort();
  }, [leads]);

  const filteredLeads = useMemo(() => {
    let result = leads;
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      result = result.filter((l) =>
        l.nombre.toLowerCase().includes(q) ||
        l.telefono.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        l.fuente.toLowerCase().includes(q) ||
        l.notas.toLowerCase().includes(q)
      );
    }
    if (filters.stages.length > 0) {
      result = result.filter((l) => filters.stages.includes(l.etapa));
    }
    if (filters.assignedTo) {
      result = result.filter((l) => l.gestionadoPor === filters.assignedTo);
    }
    return result;
  }, [leads, filters]);

  const moveLeadToStage = useCallback(
    async (lead: Lead, toStage: StageId): Promise<{ success: boolean; error?: string }> => {
      const validation = validateStageTransition({
        leadId: lead.id, fromStage: lead.etapa, toStage, lead,
      });
      if (!validation.success) return { success: false, error: validation.error };

      try {
        const leadRef = doc(db, basePath, lead.id);
        await updateDoc(leadRef, {
          etapa: toStage,
          fechaUltimoCambio: new Date().toISOString(),
          diasEnEtapa: 0,
        });
        return { success: true };
      } catch {
        return { success: false, error: 'Error al mover el lead' };
      }
    },
    [basePath]
  );

  const updateLead = useCallback(
    async (leadId: string, fields: Partial<Lead>): Promise<boolean> => {
      try {
        const leadRef = doc(db, basePath, leadId);
        await updateDoc(leadRef, { ...fields, fechaUltimoCambio: new Date().toISOString() });
        toast('Lead actualizado', 'success');
        return true;
      } catch {
        toast('Error al actualizar', 'error');
        return false;
      }
    },
    [basePath, toast]
  );

  const createLead = useCallback(
    async (data: Record<string, string>): Promise<boolean> => {
      try {
        const leadsRef = collection(db, basePath);
        await addDoc(leadsRef, {
          nombre: data.nombre || '',
          telefono: data.telefono || '',
          email: data.email || '',
          fuente: data.fuente || '',
          etapa: 'Nuevo',
          preCalificado: false,
          contratoFirmado: false,
          motivoCaida: '',
          notas: data.notas || '',
          fechaEntrada: new Date().toISOString(),
          fechaUltimoCambio: new Date().toISOString(),
          diasEnEtapa: 0,
          gestionadoPor: data.gestionadoPor || '',
        });
        toast('Lead creado exitosamente', 'success');
        return true;
      } catch {
        toast('Error al crear el lead', 'error');
        return false;
      }
    },
    [basePath, toast]
  );

  return (
    <div>
      {/* Barra superior con nombre del cliente y botón atrás */}
      <div className="mb-4 flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03] text-white/40 hover:text-white/70 hover:bg-white/[0.06] transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h2 className="text-[15px] font-display font-semibold text-white">{cliente.nombre}</h2>
          <p className="text-[11px] text-white/30 font-body">{leads.length} leads · {cliente.fuente || 'Sin fuente'}</p>
        </div>
        <div className="ml-auto">
          <button
            onClick={() => setShowNewLead(true)}
            className="flex items-center gap-2 rounded-xl bg-neon-500 px-4 py-2.5 text-xs font-semibold text-white hover:bg-neon-400 transition-colors"
          >
            Nuevo Lead
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === 'kanban' ? (
          <motion.div key="kanban" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <SearchFilterBar filters={filters} onChange={setFilters} agents={agents} />
            {loading ? (
              <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 text-neon-500 animate-spin" />
              </div>
            ) : (
              <KanbanBoard leads={filteredLeads} onMoveLeadToStage={moveLeadToStage} onSelectLead={setSelectedLead} />
            )}
          </motion.div>
        ) : (
          <motion.div key="stats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <StatsOverview leads={leads} />
          </motion.div>
        )}
      </AnimatePresence>

      <NewLeadModal open={showNewLead} onClose={() => setShowNewLead(false)} onCreate={createLead} />
      <LeadDetailPanel lead={selectedLead} onClose={() => setSelectedLead(null)} onUpdate={updateLead} />
    </div>
  );
}
