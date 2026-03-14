'use client';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { Header } from '@/components/layout/Header';
import { GlassCard } from '@/components/ui/GlassCard';
import { useAuth } from '@/hooks/useAuth';
import { Building2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

function AgenciaContent() {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        view="kanban"
        onViewChange={() => {}}
        title={user?.nombre || 'Panel Agencia'}
      />
      <main className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassCard className="max-w-md text-center">
            <div className="mb-4 mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10">
              <Building2 className="h-8 w-8 text-violet-400" />
            </div>
            <h2 className="text-lg font-display font-semibold text-white mb-2">
              Panel de Agencia
            </h2>
            <p className="text-sm text-white/40 font-body mb-4">
              Aquí verás el selector de clientes, métricas y supervisión de leads.
              Este panel se activa en la Fase 3.
            </p>
            <div className="flex items-center justify-center gap-2 text-[12px] text-neon-400 font-medium">
              <span>Fase 3 — Próximamente</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </GlassCard>
        </motion.div>
      </main>
    </div>
  );
}

export default function AgenciaPage() {
  return (
    <AuthGuard allowedRoles={['agencia']}>
      <AgenciaContent />
    </AuthGuard>
  );
}
