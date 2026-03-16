'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';
import { HelpGuide } from '@/components/ui/HelpGuide';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { StatsOverview } from '@/components/stats/StatsOverview';
import { NewLeadModal } from '@/components/kanban/NewLeadModal';
import { LeadDetailPanel } from '@/components/kanban/LeadDetailPanel';
import { SearchFilterBar, FilterState, DEFAULT_FILTERS } from '@/components/kanban/SearchFilterBar';
import { ToastProvider, useToast } from '@/components/ui/Toast';
import { useAuth } from '@/hooks/useAuth';
import { useLeads } from '@/hooks/useLeads';
import { Lead } from '@/types';

type ViewMode = 'kanban' | 'stats';

function DashboardContent() {
  const [view, setView] = useState<ViewMode>('kanban');
  const [showNewLead, setShowNewLead] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  const { user } = useAuth();
  const { leads, loading, moveLeadToStage, updateLead, createLead } = useLeads();
  const { toast } = useToast();

  // Agentes únicos para filtro
  const agents = useMemo(() => {
    const set = new Set<string>();
    leads.forEach((l) => l.gestionadoPor && set.add(l.gestionadoPor));
    return Array.from(set).sort();
  }, [leads]);

  // Leads filtrados
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

  const handleCreateLead = useCallback(async (data: Record<string, string>) => {
    const ok = await createLead(data as any);
    if (ok) toast('Lead creado exitosamente', 'success');
    else toast('Error al crear el lead', 'error');
    return ok;
  }, [createLead, toast]);

  const handleUpdateLead = useCallback(async (leadId: string, fields: Partial<Lead>) => {
    const ok = await updateLead(leadId, fields);
    if (ok) toast('Lead actualizado', 'success');
    else toast('Error al actualizar', 'error');
    return ok;
  }, [updateLead, toast]);

  return (
    <div className="flex min-h-screen flex-col pb-16 sm:pb-0 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full" />
      </div>

      <Header
        view={view}
        onViewChange={setView}
        onNewLead={() => setShowNewLead(true)}
        onShowHelp={() => setShowHelp(true)}
        title={user?.nombre || 'Pipeline'}
        loading={loading}
      />

      <main className="flex-1 overflow-hidden">
        <div className="mx-auto max-w-[1600px] p-4 lg:p-6">
          <AnimatePresence mode="wait">
            {view === 'kanban' && (
              <motion.div key="kanban" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                 transition={{ duration: 0.25 }}>
                <SearchFilterBar filters={filters} onChange={setFilters} agents={agents} />
                {loading && leads.length === 0 ? (
                  <div className="flex h-[60vh] items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 className="h-8 w-8 text-neon-500 animate-spin" />
                      <p className="text-sm text-text-muted font-body">Cargando pipeline...</p>
                    </div>
                  </div>
                ) : (
                  <KanbanBoard
                    leads={filteredLeads}
                    onMoveLeadToStage={moveLeadToStage}
                    onSelectLead={setSelectedLead}
                  />
                )}
              </motion.div>
            )}
            {view === 'stats' && (
              <motion.div
                key="stats-view"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <StatsOverview leads={filteredLeads} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <MobileNav view={view} onViewChange={setView} onNewLead={() => setShowNewLead(true)} />

      <NewLeadModal open={showNewLead} onClose={() => setShowNewLead(false)} onCreate={handleCreateLead} />
      <HelpGuide open={showHelp} onClose={() => setShowHelp(false)} />
      <LeadDetailPanel
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
        onUpdate={handleUpdateLead}
        onMove={moveLeadToStage}
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard allowedRoles={['cliente']}>
      <ToastProvider>
        <DashboardContent />
      </ToastProvider>
    </AuthGuard>
  );
}
