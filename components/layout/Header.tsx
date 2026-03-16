'use client';

import { motion } from 'framer-motion';
import { BarChart3, Kanban, Plus, RefreshCw, LogOut, User, Sun, Moon, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/context/ThemeContext';

type ViewMode = 'kanban' | 'stats';

interface HeaderProps {
  view: ViewMode;
  onViewChange?: (v: ViewMode) => void;
  onRefresh?: () => void;
  onNewLead?: () => void;
  onShowHelp?: () => void;
  loading?: boolean;
  title?: string;
}

const THEME_COLOR = process.env.NEXT_PUBLIC_THEME_COLOR || '#0A84FF';

export function Header({ view, onViewChange, onRefresh, onNewLead, onShowHelp, loading, title }: HeaderProps) {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-50 border-b border-border-subtle bg-bg-primary/80 backdrop-blur-xl supports-[backdrop-filter]:bg-bg-primary/60"
    >
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4 lg:px-6">
        {/* Izquierda: Marca */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0 items-center justify-center rounded-xl overflow-hidden border border-white/10 bg-white/5">
            <img src="/icon-192.png" alt="Logo" className="h-full w-full object-cover" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-[15px] font-display font-semibold text-text-primary tracking-tight truncate">
              {title || 'Lead Lifecycle Tracker'}
            </h1>
            <p className="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-text-muted truncate">
              {user?.rol === 'cliente' ? 'Panel de Leads' : user?.rol === 'agencia' ? 'Agencia' : 'Super Admin'}
            </p>
          </div>
        </div>

        {/* Centro: View Switcher (solo para vista de leads y no super admin) */}
        {onViewChange && user?.rol !== 'super_admin' && (
          <div className="hidden sm:flex items-center gap-1 rounded-xl bg-bg-primary/30 border border-border-subtle p-1">
            {[
              { id: 'kanban' as ViewMode, icon: Kanban, label: 'Panel de Leads' },
              { id: 'stats' as ViewMode, icon: BarChart3, label: 'Analítica' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => onViewChange(tab.id)}
                className={cn(
                  'relative flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium transition-all duration-200',
                  view === tab.id ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'
                )}
              >
                {view === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-lg bg-bg-primary/50 border border-border-subtle shadow-sm"
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
                'flex h-9 w-9 items-center justify-center rounded-xl border border-border-subtle bg-bg-primary/30 text-text-secondary hover:text-text-primary hover:bg-bg-primary/50 transition-all',
                loading && 'animate-spin'
              )}
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          )}

          {onNewLead && (
            <button
              onClick={onNewLead}
              className="hidden sm:flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold text-white transition-all hover:brightness-110"
              style={{
                background: `linear-gradient(135deg, ${THEME_COLOR}, ${THEME_COLOR}cc)`,
                boxShadow: `0 4px 20px ${THEME_COLOR}30`,
              }}
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Nuevo Lead</span>
            </button>
          )}

          {/* Info usuario + Temas + Logout */}
          <div className="flex items-center gap-1.5 sm:gap-2 ml-1 sm:ml-2 pl-1 sm:pl-2 border-l border-border-subtle">
            {onShowHelp && (
              <button
                onClick={onShowHelp}
                className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-neon-500 text-white shadow-neon active:scale-90 transition-all"
                title="Centro de Ayuda"
              >
                <HelpCircle className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={toggleTheme}
              className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-border-subtle bg-bg-primary/50 text-text-secondary hover:text-text-primary transition-all"
              title={theme === 'light' ? 'Tema Oscuro' : 'Tema Claro'}
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>
            <div className="hidden sm:block text-right">
              <p className="text-[11px] text-text-secondary font-body">{user?.nombre || user?.email}</p>
              <p className="text-[9px] text-text-muted font-mono uppercase">{user?.rol}</p>
            </div>
            <button
              onClick={signOut}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border-subtle bg-bg-primary/30 text-text-muted hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/20 transition-all"
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
