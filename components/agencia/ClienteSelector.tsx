'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Plus, Users, ChevronRight, X, Copy, CheckCircle2 } from 'lucide-react';
import { Cliente } from '@/types';
import { GlassCard } from '../ui/GlassCard';
import { cn } from '@/lib/utils';

interface ClienteSelectorProps {
  clientes: Cliente[];
  selectedId: string | null;
  onSelect: (cliente: Cliente) => void;
  onCreate: (nombre: string, fuente: string) => Promise<string | null>;
  leadsCount?: Record<string, number>;
}

export function ClienteSelector({
  clientes,
  selectedId,
  onSelect,
  onCreate,
  leadsCount = {},
}: ClienteSelectorProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [nombre, setNombre] = useState('');
  const [fuente, setFuente] = useState('');
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!nombre.trim()) return;
    setCreating(true);
    const id = await onCreate(nombre, fuente);
    setCreating(false);
    if (id) {
      setNombre('');
      setFuente('');
      setShowCreate(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const inputClass = cn(
    'w-full rounded-xl bg-black/20 border border-white/[0.08] px-4 py-2.5',
    'text-sm text-white placeholder:text-white/25 font-body',
    'focus:outline-none focus:border-neon-500/40 focus:ring-1 focus:ring-neon-500/20 transition-all'
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15">
            <Building2 className="h-5 w-5 text-violet-400" />
          </div>
          <div>
            <h2 className="text-lg font-display font-semibold text-white">Tus Clientes</h2>
            <p className="text-[11px] text-text-muted font-body">{clientes.length} cliente{clientes.length !== 1 ? 's' : ''} activo{clientes.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 rounded-xl bg-neon-500/15 border border-neon-500/20 px-4 py-2.5 text-xs font-semibold text-neon-400 hover:bg-neon-500/25 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Nuevo Cliente
        </button>
      </div>

      {/* Formulario crear cliente */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <GlassCard className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-display font-semibold text-white">Nuevo Cliente</h3>
                <button onClick={() => setShowCreate(false)} className="text-text-muted hover:text-text-secondary transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-text-muted/60">Nombre del cliente *</label>
                  <input
                    className={inputClass}
                    style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: 'white' }}
                    placeholder="Inmobiliaria ABC"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-text-muted/60">Fuente principal</label>
                  <input
                    className={inputClass}
                    placeholder="Facebook Ads"
                    value={fuente}
                    onChange={(e) => setFuente(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowCreate(false)}
                  className="rounded-xl border border-border-subtle bg-bg-primary/20 px-4 py-2 text-xs font-medium text-text-muted hover:bg-bg-primary/40 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreate}
                  disabled={creating || !nombre.trim()}
                  className="rounded-xl bg-neon-500 px-4 py-2 text-xs font-semibold text-white hover:bg-neon-400 transition-colors disabled:opacity-40"
                >
                  {creating ? 'Creando...' : 'Crear Cliente'}
                </button>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lista de clientes */}
      {clientes.length === 0 ? (
        <GlassCard className="text-center py-10">
          <Building2 className="h-10 w-10 text-text-muted/20 mx-auto mb-3" />
          <p className="text-sm text-text-muted font-body">No tienes clientes todavía</p>
          <p className="text-[11px] text-text-muted/40 font-body mt-1">Crea uno con el botón de arriba</p>
        </GlassCard>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {clientes.map((cliente, i) => (
            <motion.div
              key={cliente.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div
                onClick={() => onSelect(cliente)}
                className={cn(
                  'group relative w-full text-left rounded-2xl border p-4 transition-all duration-300 cursor-pointer',
                  'bg-bg-primary/20 backdrop-blur-md hover:bg-bg-primary/40',
                  selectedId === cliente.id
                    ? 'border-neon-500/40 shadow-neon'
                    : 'border-border-subtle hover:border-text-muted/30'
                )}
              >
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
                      <Building2 className="h-4 w-4 text-violet-400" />
                    </div>
                    <ChevronRight className="h-4 w-4 text-text-muted/40" />
                  </div>
                  <h3 className="text-[14px] font-display font-semibold text-white mb-1 truncate">
                    {cliente.nombre}
                  </h3>
                  {cliente.fuente && (
                    <p className="text-[11px] text-text-muted font-body mb-2">{cliente.fuente}</p>
                  )}
                  <div className="flex items-center gap-1.5 text-[11px] text-text-muted/50 font-mono">
                    <Users className="h-3 w-3" />
                    {leadsCount[cliente.id] || 0} leads
                  </div>
                  
                  <div className="flex items-center justify-between mt-2 gap-2">
                    <p className="text-[9px] text-text-muted/20 font-mono truncate">ID: {cliente.id}</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(cliente.id, cliente.id);
                      }}
                      className="text-text-muted/40 hover:text-neon-400 transition-colors"
                    >
                      {copiedId === cliente.id ? (
                        <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

