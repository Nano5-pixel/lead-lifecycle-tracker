'use client';

import { useState, useCallback, createContext, useContext, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

const iconMap: Record<ToastType, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: AlertTriangle,
  warning: AlertTriangle,
  info: Info,
};

const colorMap: Record<ToastType, string> = {
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#0A84FF',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = `t_${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3">
        <AnimatePresence>
          {toasts.map((t) => {
            const Icon = iconMap[t.type];
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 80, scale: 0.95 }}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-4 py-3 min-w-[320px]',
                  'border border-white/10 bg-navy-800/90 backdrop-blur-xl',
                  'shadow-[0_8px_32px_rgba(0,0,0,0.4)]'
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" style={{ color: colorMap[t.type] }} />
                <span className="flex-1 text-sm text-white/90 font-body">{t.message}</span>
                <button onClick={() => removeToast(t.id)} className="text-white/40 hover:text-white/70 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
