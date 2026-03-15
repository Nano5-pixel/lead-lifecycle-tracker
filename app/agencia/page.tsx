'use client';

import { useState, useEffect } from 'react';
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
import { Key, Copy, CheckCircle2, ShieldCheck } from 'lucide-react';
import { MobileNav } from '@/components/layout/MobileNav';
import { ClientUserManagementModal } from '@/components/agencia/ClientUserManagementModal';

type ViewMode = 'kanban' | 'stats';

function AgenciaContent() {
  const { user } = useAuth();
  const { clientes, loading, createCliente } = useClientes();
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [view, setView] = useState<ViewMode>('kanban');
  const [leadsCount, setLeadsCount] = useState<Record<string, number>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [agencyApiKey, setAgencyApiKey] = useState<string>('cargando...');
  const [managingAccessCliente, setManagingAccessCliente] = useState<Cliente | null>(null);

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
    <div className="flex min-h-screen flex-col">
      <Header
        view={view}
        onViewChange={selectedCliente ? setView : () => {}}
        title={user?.nombre || 'Panel Agencia'}
        loading={loading}
      />

      <main className="flex-1">
        <div className="mx-auto max-w-[1600px] p-4 lg:p-6">
          {selectedCliente ? (
            <AgenciaLeadsView
              agenciaId={user?.agenciaId || ''}
              cliente={selectedCliente}
              onBack={() => setSelectedCliente(null)}
              view={view}
            />
          ) : (
            <div className="space-y-6">
              <GlassCard>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h3 className="text-sm font-display font-semibold text-text-primary mb-1">Información de tu Agencia</h3>
                    <p className="text-[11px] text-text-muted font-body">Usa estos datos para configurar Make.com</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 rounded-xl bg-bg-primary/30 border border-border-subtle px-3 py-2">
                      <Key className="h-3.5 w-3.5 text-amber-400" />
                      <span className="text-[11px] font-mono text-text-muted">API Key: {agencyApiKey}</span>
                      <button
                        onClick={() => copyToClipboard(agencyApiKey, 'apikey')}
                        className="text-text-muted hover:text-text-secondary transition-colors"
                      >
                        {copiedId === 'apikey' ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                    <div className="flex items-center gap-2 rounded-xl bg-bg-primary/30 border border-border-subtle px-3 py-2">
                      <span className="text-[11px] font-mono text-text-muted">Agencia ID: {user?.agenciaId}</span>
                      <button
                        onClick={() => copyToClipboard(user?.agenciaId || '', 'agid')}
                        className="text-text-muted hover:text-text-secondary transition-colors"
                      >
                        {copiedId === 'agid' ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
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
                onManageAccess={setManagingAccessCliente}
                leadsCount={leadsCount}
              />
            </div>
          )}
        </div>
      </main>

      <ClientUserManagementModal
        open={!!managingAccessCliente}
        onClose={() => setManagingAccessCliente(null)}
        cliente={managingAccessCliente}
        agenciaId={user?.agenciaId || ''}
      />

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
