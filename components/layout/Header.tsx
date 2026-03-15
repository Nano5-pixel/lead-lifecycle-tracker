'use client';

import { motion } from 'framer-motion';
import { BarChart3, Kanban, Plus, RefreshCw, LogOut, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

type ViewMode = 'kanban' | 'stats';

interface HeaderProps {
  view: ViewMode;
  onViewChange?: (v: ViewMode) => void;
  onRefresh?: () => void;
  onNewLead?: () => void;
  loading?: boolean;
  title?: string;
}

const THEME_COLOR = process.env.NEXT_PUBLIC_THEME_COLOR || '#0A84FF';

export function Header({ view, onViewChange, onRefresh, onNewLead, loading, title }: HeaderProps) {
  const { user, signOut } = useAuth();

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-50 border-b border-white/[0.06] bg-navy-950/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4 lg:px-6">
        {/* Izquierda: Marca */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: `${THEME_COLOR}20` }}>
            <div className="h-3.5 w-3.5 rounded-md" style={{ backgroundColor: THEME_COLOR }} />
          </div>
          <div>
            <h1 className="text-[15px] font-display font-semibold text-white tracking-tight">
              {title || 'Lead Lifecycle Tracker'}
            </h1>
            <p className="text-[10px] font-mono uppercase tracking-widest text-white/30">
              {user?.rol === 'super_admin' ? 'Super Admin' : user?.rol === 'agencia' ? 'Agencia' : 'Pipeline'}
            </p>
          </div>
        </div>

        {/* Centro: View Switcher (solo para vista de leads y no super admin) */}
        {onViewChange && user?.rol !== 'super_admin' && (
          <div className="hidden sm:flex items-center gap-1 rounded-xl bg-white/[0.04] border border-white/[0.06] p-1">
            {[
              { id: 'kanban' as ViewMode, icon: Kanban, label: 'Pipeline' },
              { id: 'stats' as ViewMode, icon: BarChart3, label: 'Analítica' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => onViewChange(tab.id)}
                className={cn(
                  'relative flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium transition-all duration-200',
                  view === tab.id ? 'text-white' : 'text-white/40 hover:text-white/60'
                )}
              >
                {view === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-lg bg-white/[0.08] border border-white/[0.08]"
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  />
                )}
                <tab.icon className="relative h-3.5 w-3.5" />
                <span className="relative">{tab.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Derecha: Acciones */}
        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={loading}
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03] text-white/40 hover:text-white/70 hover:bg-white/[0.06] transition-all',
                loading && 'animate-spin'
              )}
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          )}

          {onNewLead && (
            <button
              onClick={onNewLead}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold text-white transition-all hover:brightness-110"
              style={{
                background: `linear-gradient(135deg, ${THEME_COLOR}, ${THEME_COLOR}cc)`,
                boxShadow: `0 4px 20px ${THEME_COLOR}30`,
              }}
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Nuevo Lead</span>
            </button>
          )}

          {/* Info usuario + Logout */}
          <div className="flex items-center gap-2 ml-2 pl-2 border-l border-white/[0.06]">
            <div className="hidden sm:block text-right">
              <p className="text-[11px] text-white/50 font-body">{user?.nombre || user?.email}</p>
              <p className="text-[9px] text-white/25 font-mono uppercase">{user?.rol}</p>
            </div>
            <button
              onClick={signOut}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03] text-white/30 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all"
              title="Cerrar sesión"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
