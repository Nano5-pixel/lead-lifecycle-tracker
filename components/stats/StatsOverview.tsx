import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, Trophy, Zap, Target, ArrowUpRight, Calendar, FilterX, XCircle } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Lead, PipelineStats, StageId } from '@/types';
import { STAGES } from '@/lib/stages';
import { calculateStats } from '@/lib/rules';

interface StatsOverviewProps {
  leads: Lead[];
}

export function StatsOverview({ leads }: StatsOverviewProps) {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      const entry = l.fechaEntrada ? new Date(l.fechaEntrada).getTime() : 0;
      if (dateFrom && entry < new Date(dateFrom).getTime()) return false;
      if (dateTo) {
        const endDay = new Date(dateTo);
        endDay.setHours(23, 59, 59, 999);
        if (entry > endDay.getTime()) return false;
      }
      return true;
    });
  }, [leads, dateFrom, dateTo]);

  const stats = useMemo(() => calculateStats(filteredLeads), [filteredLeads]);

  const clearFilters = () => {
    setDateFrom('');
    setDateTo('');
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Date Filters */}
      <div className="flex flex-wrap items-center gap-4 rounded-2xl bg-bg-primary/20 border border-border-subtle p-4 glass-subtle">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-neon-500" />
          <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted">Rango de Fecha:</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-text-muted font-body">Desde:</span>
            <input 
              type="date" 
              value={dateFrom} 
              onChange={(e) => setDateFrom(e.target.value)}
              className="bg-bg-primary/40 border border-border-subtle rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-neon-500/50 [color-scheme:light_dark]"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-text-muted font-body">Hasta:</span>
            <input 
              type="date" 
              value={dateTo} 
              onChange={(e) => setDateTo(e.target.value)}
              className="bg-bg-primary/40 border border-border-subtle rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-neon-500/50 [color-scheme:light_dark]"
            />
          </div>
          {(dateFrom || dateTo) && (
            <button 
              onClick={clearFilters}
              className="flex items-center gap-1.5 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-1.5 text-[10px] font-semibold text-red-400 hover:bg-red-500/20 transition-colors"
            >
              <FilterX className="h-3.5 w-3.5" />
              Limpiar
            </button>
          )}
        </div>
        <div className="ml-auto text-[11px] text-text-muted font-body">
          Mostrando <span className="text-neon-400 font-mono font-bold">{filteredLeads.length}</span> de <span className="font-mono">{leads.length}</span> leads
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <KPICard icon={Users} label="Total Leads" value={String(stats.totalLeads)}
          subtext={`+${stats.newThisWeek} esta semana`} color="#0A84FF" delay={0} />
        <KPICard icon={Trophy} label="Tiempo de Cierre" value={`${stats.avgClosingDays}d`}
          subtext="desde nuevo hasta cierre" color="#10B981" delay={0.05} />
        <KPICard icon={Zap} label="Eficiencia Inicial" value={`${stats.contactEfficiency}%`}
          subtext="contacto en < 24 horas" color="#8B5CF6" delay={0.1} />
        <KPICard icon={Target} label="Conversión Real" value={`${stats.conversionRate}%`}
          subtext="activos vs ganados" color="#F59E0B" delay={0.15} />
      </div>

      {/* Embudo + Pérdidas */}
      <div className="grid gap-4 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-display font-semibold text-text-primary">Embudo del Pipeline</h3>
            <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">distribución por etapa</span>
          </div>
          <div className="space-y-2.5">
            {STAGES.map((stage, i) => {
              const count = (stats?.byStage && stats.byStage[stage.id]) || 0;
              const maxCount = Math.max(...Object.values(stats?.byStage || {}), 1);
              const pct = (count / maxCount) * 100;
              return (
                <motion.div key={stage.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + i * 0.04 }} className="flex items-center gap-3">
                  <span className="w-5 text-center text-sm">{stage.emoji}</span>
                  <span className="w-20 sm:w-28 text-[11px] font-body text-text-secondary truncate">{stage.label}</span>
                  <div className="flex-1 h-7 rounded-lg bg-bg-primary/30 border border-border-subtle overflow-hidden relative">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                      transition={{ delay: 0.3 + i * 0.05, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute inset-y-0 left-0 rounded-lg"
                      style={{ background: `linear-gradient(90deg, ${stage.color}30, ${stage.color}60)`, borderRight: `2px solid ${stage.color}` }} />
                    <span className="relative z-10 flex h-full items-center pl-3 text-[11px] font-mono font-bold text-text-primary/70">{count}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </GlassCard>

        <LostReasonBreakdown stats={stats} />
      </div>

      {/* Agentes */}
      <div className="grid gap-4">
        <AgentPerformance leads={filteredLeads} />
      </div>
    </div>
  );
}

function LostReasonBreakdown({ stats }: { stats: PipelineStats }) {
  const reasons = Object.entries(stats.lostReasons || {}).sort((a, b) => b[1] - a[1]);
  const totalLost = stats.lostCount || 1;

  return (
    <GlassCard initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-display font-semibold text-text-primary text-red-400">Motivos de Pérdida</h3>
        <XCircle className="h-4 w-4 text-red-500/50" />
      </div>
      <div className="space-y-4">
        {reasons.length > 0 ? reasons.map(([reason, count], i) => (
          <div key={reason} className="space-y-1.5">
            <div className="flex justify-between text-[11px]">
              <span className="text-text-secondary font-medium">{reason}</span>
              <span className="text-text-muted font-mono">{count}</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-bg-primary/30 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }} 
                animate={{ width: `${(count / totalLost) * 100}%` }}
                transition={{ delay: 0.4 + i * 0.05, duration: 0.8 }}
                className="h-full bg-red-500/40 rounded-full" 
              />
            </div>
          </div>
        )) : (
          <div className="py-10 text-center text-[11px] text-text-muted/40 font-body">No hay datos de pérdida suficientes</div>
        )}
      </div>
    </GlassCard>
  );
}

function KPICard({ icon: Icon, label, value, subtext, color, delay }: {
  icon: any; label: string; value: string; subtext: string; color: string; delay: number;
}) {
  return (
    <GlassCard hoverGlow glowColor={`${color}15`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${color}15` }}>
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
        <ArrowUpRight className="h-4 w-4 text-text-muted/30" />
      </div>
      <div className="text-2xl font-display font-bold text-text-primary tracking-tight">{value}</div>
      <div className="mt-0.5 text-[11px] font-body text-text-secondary">{label}</div>
      <div className="mt-2 text-[10px] font-body text-text-muted">{subtext}</div>
    </GlassCard>
  );
}

function AgentPerformance({ leads }: { leads: Lead[] }) {
  const agents = useMemo(() => {
    const map: Record<string, { total: number; won: number; active: number }> = {};
    leads.forEach((l) => {
      const agent = l.gestionadoPor || 'Sin asignar';
      if (agent === 'Sin asignar') return; 
      if (!map[agent]) map[agent] = { total: 0, won: 0, active: 0 };
      map[agent].total++;
      if (l.etapa === 'Ganado') map[agent].won++;
      if (!['Ganado', 'Perdido', 'Basura'].includes(l.etapa)) map[agent].active++;
    });
    return Object.entries(map).sort((a, b) => b[1].won - a[1].won).slice(0, 5);
  }, [leads]);

  return (
    <GlassCard initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
      <h3 className="mb-4 text-sm font-display font-semibold text-text-primary">Rendimiento por Agente</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              {['Agente', 'Total', 'Activos', 'Ganados', 'Efectividad'].map((h) => (
                <th key={h} className="pb-3 text-left text-[10px] font-mono uppercase tracking-wider text-text-muted font-normal">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.02]">
            {agents.map(([name, data]) => (
              <tr key={name} className="group">
                <td className="py-4 text-[13px] font-display font-medium text-text-primary">{name}</td>
                <td className="py-4 text-xs font-mono text-text-muted">{data.total}</td>
                <td className="py-4 text-xs font-mono text-blue-400">{data.active}</td>
                <td className="py-4 text-xs font-mono text-emerald-400">{data.won}</td>
                <td className="py-4">
                   <div className="flex items-center gap-2">
                     <span className="text-xs font-mono font-bold text-text-secondary">{data.total > 0 ? Math.round((data.won/data.total)*100) : 0}%</span>
                     <div className="h-1 w-12 rounded-full bg-white/5 overflow-hidden hidden sm:block">
                        <div className="h-full bg-emerald-500" style={{ width: `${(data.won/data.total)*100}%` }} />
                     </div>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {agents.length === 0 && <p className="py-10 text-center text-xs text-text-muted font-body italic">No hay agentes asignados con leads</p>}
    </GlassCard>
  );
}
