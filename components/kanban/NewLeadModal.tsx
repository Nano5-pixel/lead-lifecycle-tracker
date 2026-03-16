'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NewLeadModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: Record<string, string>) => Promise<boolean>;
}

export function NewLeadModal({ open, onClose, onCreate }: NewLeadModalProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nombre: '', telefono: '', email: '', fuente: '', notas: '', gestionadoPor: '',
  });

  const handleSubmit = async () => {
    if (!form.nombre.trim()) return;
    setLoading(true);
    const ok = await onCreate(form);
    setLoading(false);
    if (ok) {
      setForm({ nombre: '', telefono: '', email: '', fuente: '', notas: '', gestionadoPor: '' });
      onClose();
    }
  };

  const inputClass = cn(
    'w-full rounded-xl bg-black/20 border border-white/20 px-4 py-2.5',
    'text-sm text-white placeholder:text-text-muted font-body',
    'focus:outline-none focus:border-neon-500/40 focus:ring-1 focus:ring-neon-500/20 transition-all'
  );

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 z-[101] -translate-x-1/2 -translate-y-1/2 w-full max-w-lg rounded-2xl border border-border-subtle bg-bg-primary/95 backdrop-blur-xl p-6 shadow-glass"
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-neon-500/30 to-transparent rounded-t-2xl" />
            <button onClick={onClose} className="absolute right-4 top-4 text-text-muted hover:text-text-secondary transition-colors">
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neon-500/15">
                <UserPlus className="h-5 w-5 text-neon-400" />
              </div>
              <div>
                <h2 className="text-lg font-display font-semibold text-text-primary">Nuevo Lead</h2>
                <p className="text-[11px] text-text-muted font-body">Se creará en etapa &quot;Nuevo&quot;</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-text-muted">Nombre *</label>
                  <input className={inputClass} placeholder="Juan Pérez" value={form.nombre}
                    style={{ backgroundColor: 'rgba(0,0,0,0.4)', color: 'white' }}
                    onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))} />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-text-muted">Teléfono</label>
                  <input className={inputClass} placeholder="+52 555 123 4567" value={form.telefono}
                    onChange={(e) => setForm((f) => ({ ...f, telefono: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-medium text-text-muted">Email</label>
                <input className={inputClass} placeholder="juan@ejemplo.com" type="email" value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-text-muted">Fuente</label>
                  <input className={inputClass} placeholder="Facebook Ads, Referido..." value={form.fuente}
                    onChange={(e) => setForm((f) => ({ ...f, fuente: e.target.value }))} />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-text-muted">Gestionado por</label>
                  <input className={inputClass} placeholder="Nombre del agente" value={form.gestionadoPor}
                    onChange={(e) => setForm((f) => ({ ...f, gestionadoPor: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-medium text-text-muted">Notas</label>
                <textarea className={cn(inputClass, 'resize-none h-20')} placeholder="Notas adicionales..."
                  style={{ backgroundColor: 'rgba(0,0,0,0.4)', color: 'white' }}
                  value={form.notas} onChange={(e) => setForm((f) => ({ ...f, notas: e.target.value }))} />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button onClick={onClose}
                className="flex-1 rounded-xl border border-border-subtle bg-bg-primary/20 py-2.5 text-sm font-medium text-text-muted hover:bg-bg-primary/40 transition-colors">
                Cancelar
              </button>
              <button onClick={handleSubmit} disabled={loading || !form.nombre.trim()}
                className={cn(
                  'flex-1 rounded-xl bg-neon-500 py-2.5 text-sm font-semibold text-white',
                  'hover:bg-neon-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed'
                )}>
                {loading ? 'Creando...' : 'Crear Lead'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
