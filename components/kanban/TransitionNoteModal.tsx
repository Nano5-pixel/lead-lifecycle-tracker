'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, ArrowRight, SkipForward } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { StageId } from '@/types';

interface TransitionNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (note: string) => void;
  targetStage: StageId | null;
}

export function TransitionNoteModal({ isOpen, onClose, onConfirm, targetStage }: TransitionNoteModalProps) {
  const [note, setNote] = useState('');

  const handleConfirm = () => {
    onConfirm(note);
    setNote('');
  };

  const handleSkip = () => {
    onConfirm('');
    setNote('');
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
            <div className="relative h-24 flex-shrink-0 w-full overflow-hidden border-b border-white/5 bg-neon-500/10">
              <div className="absolute inset-0 opacity-20 blur-2xl bg-neon-500" />
              <div className="relative flex h-full items-center justify-between px-8">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neon-500/20 text-neon-500 border border-neon-500/30 shadow-lg">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-display font-bold text-text-primary tracking-tight leading-none">
                      ¿Añadir una nota?
                    </h2>
                    <p className="mt-1 text-[10px] font-mono text-text-muted uppercase tracking-widest leading-none">
                      Hacia etapa: <span className="text-neon-400">{targetStage}</span>
                    </p>
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
            <div className="p-8 space-y-4">
              <p className="text-sm text-text-secondary leading-relaxed">
                Escribe un resumen rápido de lo que pasó con este lead para el seguimiento:
              </p>

              <div className="relative group">
                <textarea
                  autoFocus
                  placeholder="Ej: El cliente está muy interesado pero pidió llamarlo después de las 5pm..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className={cn(
                    "w-full h-32 rounded-2xl bg-black/40 border border-white/10 p-4 text-sm text-white placeholder:text-white/20 transition-all no-scrollbar",
                    "focus:outline-none focus:border-neon-500/40 focus:ring-1 focus:ring-neon-500/20"
                  )}
                />
                <div className="absolute bottom-3 right-3 opacity-20 group-focus-within:opacity-40 transition-opacity">
                   <MessageSquare className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-white/5 bg-white/[0.02] p-8 flex gap-3">
              <button
                onClick={handleSkip}
                className="flex-1 py-4 rounded-2xl text-[11px] font-black uppercase tracking-wider text-text-muted border border-white/5 hover:bg-white/5 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <SkipForward className="h-4 w-4" />
                Omitir
              </button>
              <button
                disabled={!note.trim()}
                onClick={handleConfirm}
                className={cn(
                  "flex-[2] py-4 rounded-2xl text-sm font-black uppercase tracking-wider text-white shadow-2xl transition-all active:scale-95 disabled:opacity-30 disabled:grayscale",
                  "bg-gradient-to-r from-neon-600 to-neon-500 flex items-center justify-center gap-2 shadow-neon-500/10"
                )}
              >
                Confirmar
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
