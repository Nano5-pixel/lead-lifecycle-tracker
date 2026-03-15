'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Header } from '@/components/layout/Header';
import { ToastProvider } from '@/components/ui/Toast';
import { ClienteSelector } from '@/components/agencia/ClienteSelector';
import { AgenciaLeadsView } from '@/components/agencia/AgenciaLeadsView';
import { useAuth } from '@/hooks/useAuth';
import { useClientes } from '@/hooks/useClientes';
import { Cliente } from '@/types';
import { GlassCard } from '@/components/ui/GlassCard';
import { Key, Copy, CheckCircle2, ChevronRight } from 'lucide-react';
import { MobileNav } from '@/components/layout/MobileNav';
import { cn } from '@/lib/utils';

type ViewMode = 'kanban' | 'stats';

function AgenciaContent() {
  const { user } = useAuth();
  const { clientes, loading, createCliente } = useClientes();
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [view, setView] = useState<ViewMode>('kanban');
  const [leadsCount, setLeadsCount] = useState<Record<string, number>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [agencyApiKey, setAgencyApiKey] = useState<string>('cargando...');

  // Cargar API Key real de la agencia
  useEffect(() => {
    if (!user?.agenciaId) return;

    const fetchAgencyData = async () => {
      try {
        const agencyRef = doc(db, 'agencias', user.agenciaId);
        const agencySnap = await getDoc(agencyRef);
        if (agencySnap.exists()) {
          setAgencyApiKey(agencySnap.data().apiKey || 'Sin API Key');
        } else {
          setAgencyApiKey('No encontrada');
        }
      } catch (error) {
        console.error('Error fetching agency data:', error);
        setAgencyApiKey('Error');
      }
    };

    fetchAgencyData();
  }, [user?.agenciaId]);

  useEffect(() => {
    if (!user?.agenciaId || clientes.length === 0) return;

    const unsubscribes: (() => void)[] = [];

    clientes.forEach((cliente) => {
      const path = `agencias/${user.agenciaId}/clientes/${cliente.id}/leads`;
      const leadsRef = collection(db, path);
      const unsubscribe = onSnapshot(query(leadsRef), (snapshot) => {
        setLeadsCount((prev) => ({ ...prev, [cliente.id]: snapshot.size }));
      });
      unsubscribes.push(unsubscribe);
    });

    return () => unsubscribes.forEach((u) => u());
  }, [user, clientes]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex min-h-screen flex-col relative overflow-hidden">
      {/* Premium Background Gradients */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full" />
      </div>

      <Header
        view={view}
        onViewChange={selectedCliente ? setView : () => {}}
        title={user?.nombre || 'Panel Agencia'}
        loading={loading}
      />

      <main className="flex-1 relative z-10">
        <div className="mx-auto max-w-[1600px] p-4 lg:p-6 space-y-6">
          
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-[10px] sm:text-xs font-medium bg-white/5 border border-white/10 w-fit px-4 py-1.5 rounded-full backdrop-blur-md">
            <button 
              onClick={() => setSelectedCliente(null)}
              className={cn("hover:text-neon-400 transition-colors uppercase tracking-widest", !selectedCliente ? "text-neon-400" : "text-text-muted")}
            >
              Mis Clientes
            </button>
            {selectedCliente && (
              <>
                <ChevronRight className="h-3 w-3 text-text-muted" />
                <span className="text-neon-400 capitalize">{selectedCliente.nombre}</span>
              </>
            )}
          </div>

          <AnimatePresence mode="wait">
            {selectedCliente ? (
              <motion.div 
                key="leads-view"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <AgenciaLeadsView
                  agenciaId={user?.agenciaId || ''}
                  cliente={selectedCliente}
                  onBack={() => setSelectedCliente(null)}
                  view={view}
                />
              </motion.div>
            ) : (
              <motion.div 
                key="client-selector"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <GlassCard className="bg-white/[0.01] border-white/5 shadow-2xl">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <h3 className="text-sm font-display font-black text-violet-400 uppercase tracking-widest mb-1">Tu Agencia: <span className="text-text-primary px-2">{user?.nombre}</span></h3>
                      <p className="text-[11px] text-text-muted font-body">Configuración técnica para integraciones (Make.com)</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 rounded-xl bg-violet-500/5 border border-violet-500/10 px-3 py-2 group hover:bg-violet-500/10 transition-all">
                        <Key className="h-3.5 w-3.5 text-amber-400" />
                        <span className="text-[10px] font-mono text-text-muted">API KEY</span>
                        <button
                          onClick={() => copyToClipboard(agencyApiKey, 'apikey')}
                          className="text-text-muted hover:text-white transition-colors"
                        >
                          {copiedId === 'apikey' ? <CheckCircle2 className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </GlassCard>

                <ClienteSelector
                  clientes={clientes}
                  selectedId={(selectedCliente as Cliente | null)?.id || null}
                  onSelect={setSelectedCliente}
                  onCreate={createCliente}
                  leadsCount={leadsCount}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {selectedCliente && (
        <MobileNav 
          view={view} 
          onViewChange={setView} 
          onNewLead={() => (window as any).openNewLeadModal?.()} 
        />
      )}
    </div>
  );
}


export default function AgenciaPage() {
  return (
    <AuthGuard allowedRoles={['agencia']}>
      <ToastProvider>
        <AgenciaContent />
      </ToastProvider>
    </AuthGuard>
  );
}
