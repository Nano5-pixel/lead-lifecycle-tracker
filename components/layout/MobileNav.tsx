'use client';

import { motion } from 'framer-motion';
import { Kanban, BarChart3, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

type ViewMode = 'kanban' | 'stats';

interface MobileNavProps {
  view: ViewMode;
  onViewChange: (v: ViewMode) => void;
  onNewLead: () => void;
}

export function MobileNav({ view, onViewChange, onNewLead }: MobileNavProps) {
  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-6 inset-x-4 z-50 sm:hidden"
    >
      <div className="glass-premium rounded-2xl flex items-center justify-around px-4 py-3 shadow-2xl">
        <button
          onClick={() => onViewChange('kanban')}
          className={cn(
            'flex flex-col items-center gap-1 py-1 px-4 transition-all duration-300',
            view === 'kanban' ? 'text-neon-500' : 'text-text-muted hover:text-text-secondary'
          )}
        >
          <Kanban className={cn("h-5 w-5 transition-transform duration-300", view === 'kanban' && "scale-110")} />
          <span className="text-[10px] font-semibold tracking-wide">Leads</span>
        </button>

        <button
          onClick={onNewLead}
          className="relative -top-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-neon-500 text-white shadow-neon active:scale-95 transition-all duration-300 hover:brightness-110"
        >
          <Plus className="h-6 w-6" />
          <div className="absolute -inset-2 bg-neon-500/20 blur-2xl rounded-full -z-10" />
        </button>

        <button
          onClick={() => onViewChange('stats')}
          className={cn(
            'flex flex-col items-center gap-1 py-1 px-4 transition-all duration-300',
            view === 'stats' ? 'text-neon-500' : 'text-text-muted hover:text-text-secondary'
          )}
        >
          <BarChart3 className={cn("h-5 w-5 transition-transform duration-300", view === 'stats' && "scale-110")} />
          <span className="text-[10px] font-semibold tracking-wide">Analítica</span>
        </button>
      </div>
    </motion.nav>
  );
}
