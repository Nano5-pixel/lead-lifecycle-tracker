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
      className="fixed bottom-0 inset-x-0 z-50 sm:hidden border-t border-border-subtle bg-bg-primary/90 backdrop-blur-xl"
    >
      <div className="flex items-center justify-around px-4 py-2">
        <button
          onClick={() => onViewChange('kanban')}
          className={cn(
            'flex flex-col items-center gap-1 py-1.5 px-4 rounded-xl transition-all',
            view === 'kanban' ? 'text-text-primary' : 'text-text-tertiary'
          )}
        >
          <Kanban className="h-5 w-5" />
          <span className="text-[10px] font-medium">Pipeline</span>
        </button>
        <button
          onClick={() => (window as any).openNewLeadModal && (window as any).openNewLeadModal()}
          className="flex flex-col items-center gap-1 text-white"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neon-500 shadow-neon">
            <Plus className="h-5 w-5" />
          </div>
          <span className="text-[10px] font-medium">Nuevo</span>
        </button>
        <button
          onClick={() => onViewChange('stats')}
          className={cn(
            'flex flex-col items-center gap-1 py-1.5 px-4 rounded-xl transition-all',
            view === 'stats' ? 'text-neon-400' : 'text-text-muted'
          )}
        >
          <BarChart3 className="h-5 w-5" />
          <span className="text-[10px] font-medium">Analítica</span>
        </button>
      </div>
    </motion.nav>
  );
}
