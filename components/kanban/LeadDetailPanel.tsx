'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, User, Phone, Mail, MessageCircle, Tag,
  CheckCircle2, FileCheck, Save, Clock, AlertTriangle,
} from 'lucide-react';
import { Lead } from '@/types';
import { StatusBadge } from '../ui/StatusBadge';
import { cn, formatDate, whatsappLink, phoneLink } from '@/lib/utils';

interface LeadDetailPanelProps {
  lead: Lead | null;
  onClose: () => void;
  onUpdate: (leadId: string, fields: Partial<Lead>) => Promise<boolean>;
}

export function LeadDetailPanel({ lead, onClose, onUpdate }: LeadDetailPanelProps) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<Lead>>({});

  useEffect(() => {
    if (lead) {
      setForm({
        nombre: lead.nombre, telefono: lead.telefono, email: lead.email,
        fuente: lead.fuente, notas: lead.notas, gestionadoPor: lead.gestionadoPor,
        motivoCaida: lead.motivoCaida,
      });
      setEditing(false);
    }
  }, [lead]);

  const handleSave = async () => {
    if (!lead) return;
    setSaving(true);
    await onUpdate(lead.id, form);
    setSaving(false);
    setEditing(false);
  };

  const inputClass = cn(
    'w-full rounded-lg bg-white/[0.04] border border-white/[0.08] px-3 py-2',
    'text-sm text-white placeholder:text-white/20 font-body',
    'focus:outline-none focus:border-neon-500/40 focus:ring-1 focus:ring-neon-500/20 transition-all disabled:opacity-40'
  );

  const open = lead !== null;

  return (
    <AnimatePresence>
      {open && lead && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm" onClick={onClose} />
          <motion.aside
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 z-[81] h-full w-full max-w-md border-l border-white/[0.06] bg-navy-900/95 backdrop-blur-xl overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/[0.06] bg-navy-900/80 backdrop-blur-xl px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06]">
                  <User className="h-5 w-5 text-white/50" />
                </div>
                <div>
                  <h2 className="text-[15px] font-display font-semibold text-white">{lead.nombre || 'Sin nombre'}</h2>
                  <StatusBadge stageId={lead.etapa} size="sm" />
                </div>
              </div>
              <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-all">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Acciones rápidas */}
              <div className="flex gap-2">
                {lead.telefono && (
                  <>
                    <a href={whatsappLink(lead.telefono)} target="_blank" rel="noopener noreferrer"
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/15 py-2.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-colors">
                      <MessageCircle className="h-4 w-4" />WhatsApp
                    </a>
                    <a href={phoneLink(lead.telefono)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-neon-500/10 border border-neon-500/15 py-2.5 text-xs font-semibold text-neon-400 hover:bg-neon-500/20 transition-colors">
                      <Phone className="h-4 w-4" />Llamar
                    </a>
                  </>
                )}
                {lead.email && (
                  <a href={`mailto:${lead.email}`}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-violet-500/10 border border-violet-500/15 py-2.5 text-xs font-semibold text-violet-400 hover:bg-violet-500/20 transition-colors">
                    <Mail className="h-4 w-4" />Email
                  </a>
                )}
              </div>

              {/* Días en etapa */}
              {lead.diasEnEtapa > 0 && (
                <div className={cn(
                  'rounded-xl border p-3 flex items-center gap-3',
                  lead.diasEnEtapa >= 7 ? 'border-red-500/20 bg-red-500/[0.06]' : 'border-amber-500/15 bg-amber-500/[0.04]'
                )}>
                  <Clock className={cn('h-5 w-5', lead.diasEnEtapa >= 7 ? 'text-red-400' : 'text-amber-400')} />
                  <div>
                    <p className={cn('text-sm font-display font-semibold', lead.diasEnEtapa >= 7 ? 'text-red-400' : 'text-amber-400')}>
                      {lead.diasEnEtapa} días en esta etapa
                    </p>
                    {lead.diasEnEtapa >= 7 && (
                      <p className="text-[10px] text-red-400/60 flex items-center gap-1 mt-0.5">
                        <AlertTriangle className="h-3 w-3" />Requiere atención — más de 7 días sin movimiento
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-mono uppercase tracking-wider text-white/30">Información</h4>
                  {!editing ? (
                    <button onClick={() => setEditing(true)} className="text-[11px] text-neon-400 hover:text-neon-300 font-medium transition-colors">Editar</button>
                  ) : (
                    <button onClick={handleSave} disabled={saving}
                      className="flex items-center gap-1.5 text-[11px] text-emerald-400 hover:text-emerald-300 font-medium transition-colors disabled:opacity-50">
                      <Save className="h-3 w-3" />{saving ? 'Guardando...' : 'Guardar'}
                    </button>
                  )}
                </div>

                {[
                  { icon: User, label: 'Nombre', key: 'nombre' },
                  { icon: Phone, label: 'Teléfono', key: 'telefono' },
                  { icon: Mail, label: 'Email', key: 'email', type: 'email' },
                  { icon: Tag, label: 'Fuente', key: 'fuente' },
                  { icon: User, label: 'Gestionado por', key: 'gestionadoPor' },
                ].map(({ icon: Icon, label, key, type }) => (
                  <div key={key}>
                    <label className="mb-1 flex items-center gap-1.5 text-[11px] font-medium text-white/30">
                      <Icon className="h-3 w-3" />{label}
                    </label>
                    <input className={inputClass} value={(form as any)[key] || ''} disabled={!editing}
                      type={type || 'text'}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} />
                  </div>
                ))}

                {(lead.etapa === 'Perdido' || lead.motivoCaida) && (
                  <div>
                    <label className="mb-1 flex items-center gap-1.5 text-[11px] font-medium text-white/30">
                      <AlertTriangle className="h-3 w-3" />Motivo de Caída
                    </label>
                    <textarea className={cn(inputClass, 'resize-none h-16')} value={form.motivoCaida || ''}
                      disabled={!editing} placeholder="¿Por qué se perdió este lead?"
                      onChange={(e) => setForm((f) => ({ ...f, motivoCaida: e.target.value }))} />
                  </div>
                )}

                <div>
                  <label className="mb-1 block text-[11px] font-medium text-white/30">Notas</label>
                  <textarea className={cn(inputClass, 'resize-none h-24')} value={form.notas || ''}
                    disabled={!editing}
                    onChange={(e) => setForm((f) => ({ ...f, notas: e.target.value }))} />
                </div>
              </div>

              {/* Metadatos */}
              <div className="rounded-xl border border-white/[0.04] bg-white/[0.01] p-4 space-y-2">
                <h4 className="text-[10px] font-mono uppercase tracking-wider text-white/20 mb-2">Metadatos</h4>
                {[
                  { label: 'ID Lead', value: lead.id },
                  { label: 'Fecha Entrada', value: formatDate(lead.fechaEntrada) },
                  { label: 'Último Cambio', value: formatDate(lead.fechaUltimoCambio) },
                  { label: 'Días en Etapa', value: `${lead.diasEnEtapa} días` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-[11px] text-white/20 font-body">{label}</span>
                    <span className="text-[11px] text-white/40 font-mono">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
