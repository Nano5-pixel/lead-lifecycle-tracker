'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, X } from 'lucide-react';

interface RuleViolationModalProps {
  open: boolean;
  onClose: () => void;
  message: string;
  ruleId?: string;
}

export function RuleViolationModal({ open, onClose, message, ruleId }: RuleViolationModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 z-[101] -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-2xl border border-red-500/20 bg-bg-primary/95 backdrop-blur-xl p-6 shadow-[0_16px_48px_rgba(239,68,68,0.15)]"
          >
            <button onClick={onClose} className="absolute right-4 top-4 text-text-muted hover:text-text-secondary transition-colors">
              <X className="h-5 w-5" />
            </button>
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20">
                <ShieldAlert className="h-8 w-8 text-red-400" />
              </div>
              {ruleId && (
                <span className="mb-3 inline-flex items-center rounded-full bg-red-500/10 border border-red-500/20 px-3 py-1 text-xs font-mono font-semibold text-red-400">
                  {ruleId}
                </span>
              )}
              <h3 className="mb-2 text-lg font-display font-semibold text-text-primary">Transición Bloqueada</h3>
              <p className="mb-6 text-sm text-text-muted leading-relaxed font-body">{message}</p>
              <button
                onClick={onClose}
                className="w-full rounded-xl bg-bg-primary/20 border border-border-subtle py-2.5 text-sm font-medium text-text-primary hover:bg-bg-primary/40 transition-colors"
              >
                Entendido
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
