'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, CheckCircle2, Info, XCircle, PhoneOff, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface LostReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  title?: string;
}

const REASONS = [
  { id: 'Precio alto', label: 'Precio muy alto', icon: Info, color: '#F59E0B' },
  { id: 'Sin respuesta', label: 'No responde / Fantasma', icon: PhoneOff, color: '#6B7280' },
  { id: 'Competencia', label: 'Se fue con la competencia', icon: CheckCircle2, color: '#8B5CF6' },
  { id: 'Solo información', label: 'Solo buscaba información', icon: HelpCircle, color: '#3B82F6' },
  { id: 'Número equivocado', label: 'Teléfono/Email malo', icon: XCircle, color: '#EF4444' },
  { id: 'Otro', label: 'Otro motivo', icon: AlertCircle, color: '#94A3B8' },
];

export function LostReasonModal({ isOpen, onClose, onConfirm, title }: LostReasonModalProps) {
  const [selected, setSelected] = useState('');

  const handleConfirm = () => {
    if (selected) {
      onConfirm(selected);
      setSelected('');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative z-[121] w-full max-w-md overflow-hidden rounded-[2.5rem] border border-white/20 bg-bg-primary shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="relative h-24 flex-shrink-0 w-full overflow-hidden border-b border-white/5 bg-red-500/10">
              <div className="absolute inset-0 opacity-20 blur-2xl bg-red-500" />
              <div className="relative flex h-full items-center justify-between px-8">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/20 text-red-500 border border-red-500/30 shadow-lg">
                    <AlertCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-display font-bold text-text-primary tracking-tight leading-none">
                      {title || 'Motivo de Pérdida'}
                    </h2>
                    <p className="mt-1 text-[10px] font-mono text-text-muted uppercase tracking-widest leading-none">Paso obligatorio</p>
                  </div>
                </div>
                <button 
                  onClick={onClose}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-text-muted hover:bg-white/10 transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 space-y-6">
              <p className="text-sm text-text-secondary leading-relaxed">
                Para mejorar la analítica, por favor indica por qué no pudimos cerrar este lead:
              </p>

              <div className="grid gap-2">
                {REASONS.map((reason) => (
                  <button
                    key={reason.id}
                    onClick={() => setSelected(reason.id)}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 group",
                      selected === reason.id 
                        ? "bg-bg-primary border-white/20 shadow-xl scale-[1.02]" 
                        : "bg-bg-primary/20 border-white/5 hover:border-white/10"
                    )}
                  >
                    <div 
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300",
                        selected === reason.id ? "shadow-lg scale-110" : "opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-100"
                      )}
                      style={{ 
                        backgroundColor: `${reason.color}20`, 
                        color: reason.color,
                        border: selected === reason.id ? `1.5px solid ${reason.color}40` : `1px solid transparent`
                      }}
                    >
                      <reason.icon className="h-5 w-5" />
                    </div>
                    <span className={cn(
                      "text-sm font-semibold transition-colors duration-300",
                      selected === reason.id ? "text-text-primary" : "text-text-muted group-hover:text-text-secondary"
                    )}>
                      {reason.label}
                    </span>
                    {selected === reason.id && (
                      <div className="ml-auto h-2 w-2 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)] bg-white" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-white/5 bg-white/[0.02] p-8">
              <button
                disabled={!selected}
                onClick={handleConfirm}
                className={cn(
                  "w-full py-4 rounded-2xl text-sm font-black uppercase tracking-wider text-white shadow-2xl transition-all active:scale-95 disabled:opacity-30 disabled:grayscale",
                  "bg-gradient-to-r from-red-600 to-red-500"
                )}
              >
                Confirmar y Cerrar Lead
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
