import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, TrendingUp, Trophy, XCircle, Zap, Target, ArrowUpRight, Clock, Calendar, FilterX } from 'lucide-react';
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
        // Set dateTo to end of day
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
    <div className="space-y-6">
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
              className="bg-bg-primary/40 border border-border-subtle rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-neon-500/50"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-text-muted font-body">Hasta:</span>
            <input 
              type="date" 
              value={dateTo} 
              onChange={(e) => setDateTo(e.target.value)}
              className="bg-bg-primary/40 border border-border-subtle rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-neon-500/50"
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
        <KPICard icon={Users} label="Leads Totales" value={String(stats.totalLeads)}
          subtext={`+${stats.newThisWeek} esta semana`} color="#0A84FF" delay={0} />
        <KPICard icon={TrendingUp} label="Tasa de Conversión" value={`${stats.conversionRate}%`}
          subtext="leads activos → ganados" color="#10B981" delay={0.05} />
        <KPICard icon={Clock} label="Prom. Días en Etapa" value={`${stats.avgDaysInStage}d`}
          subtext="promedio todas las etapas" color="#8B5CF6" delay={0.1} />
        <KPICard icon={Trophy} label="Ganados" value={String(stats.byStage['Ganado'] || 0)}
          subtext={`de ${stats.totalLeads} leads totales`} color="#F59E0B" delay={0.15} />
      </div>

      {/* Embudo + Resumen */}
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

        <GlassCard initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h3 className="mb-4 text-sm font-display font-semibold text-text-primary">Resumen Rápido</h3>
          <div className="space-y-4">
            <QuickStat icon={Zap} label="Nuevos esta semana" value={String(stats.newThisWeek)} color="#0A84FF" />
            <QuickStat icon={Target} label="En calificación"
              value={String((stats.byStage['Intento'] || 0) + (stats.byStage['Contactado'] || 0))} color="#8B5CF6" />
            <QuickStat icon={Trophy} label="Ganados" value={String(stats.byStage['Ganado'] || 0)} color="#10B981" />
            <QuickStat icon={XCircle} label="Perdidos" value={String(stats.lostCount)} color="#EF4444" />
            <div className="mt-4 pt-4 border-t border-border-subtle">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-text-muted font-body">Tasa de Éxito</span>
                <span className="text-lg font-display font-bold text-emerald-500">{stats.conversionRate}%</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-bg-primary/50 overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(stats.conversionRate, 100)}%` }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400" />
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Fuentes + Agentes */}
      <div className="grid gap-4 lg:grid-cols-2">
        <SourceBreakdown leads={leads} />
        <AgentPerformance leads={leads} stats={stats} />
      </div>
    </div>
  );
}

function KPICard({ icon: Icon, label, value, subtext, color, delay }: {
  icon: typeof Users; label: string; value: string; subtext: string; color: string; delay: number;
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

function QuickStat({ icon: Icon, label, value, color }: {
  icon: typeof Users; label: string; value: string; color: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: `${color}12` }}>
        <Icon className="h-4 w-4" style={{ color }} />
      </div>
      <div className="flex-1"><p className="text-[11px] text-text-muted font-body">{label}</p></div>
      <span className="text-sm font-display font-bold text-text-primary">{value}</span>
    </div>
  );
}

const SOURCE_COLORS: Record<string, string> = {
  'Facebook Ads': '#1877F2', 'Google Ads': '#34A853', Instagram: '#E1306C',
  Referido: '#F59E0B', 'Landing Page': '#06B6D4', Otro: '#6B7280',
};

function SourceBreakdown({ leads }: { leads: Lead[] }) {
  const sources = useMemo(() => {
    const map: Record<string, number> = {};
    leads.forEach((l) => { const src = l.fuente || 'Otro'; map[src] = (map[src] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [leads]);
  const total = leads.length || 1;

  return (
    <GlassCard initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
      <h3 className="mb-4 text-sm font-display font-semibold text-text-primary">Fuentes de Leads</h3>
      <div className="mb-4 flex h-5 w-full overflow-hidden rounded-full bg-bg-primary/30">
        {sources.map(([name, count], i) => {
          const pct = (count / total) * 100;
          const color = SOURCE_COLORS[name] || SOURCE_COLORS['Otro'];
          return (
            <motion.div key={name} initial={{ width: 0 }} animate={{ width: `${pct}%` }}
              transition={{ delay: 0.4 + i * 0.05, duration: 0.6 }}
              className="h-full first:rounded-l-full last:rounded-r-full"
              style={{ backgroundColor: color }} title={`${name}: ${count}`} />
          );
        })}
      </div>
      <div className="space-y-2">
        {sources.map(([name, count]) => {
          const pct = Math.round((count / total) * 100);
          const color = SOURCE_COLORS[name] || SOURCE_COLORS['Otro'];
          return (
            <div key={name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: color }} />
                <span className="text-[12px] text-text-secondary font-body">{name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-text-muted font-mono">{pct}%</span>
                <span className="text-[12px] font-display font-semibold text-text-primary w-6 text-right">{count}</span>
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}

function AgentPerformance({ leads, stats }: { leads: Lead[]; stats: PipelineStats }) {
  const agents = useMemo(() => {
    const map: Record<string, { total: number; won: number; active: number }> = {};
    const list = leads || [];
    list.forEach((l) => {
      const agent = l.gestionadoPor || 'Sin asignar';
      if (!map[agent]) map[agent] = { total: 0, won: 0, active: 0 };
      map[agent].total++;
      if (l.etapa === 'Ganado') map[agent].won++;
      if (l.etapa !== 'Ganado' && l.etapa !== 'Perdido') map[agent].active++;
    });
    return Object.entries(map).sort((a, b) => (b[1].won || 0) - (a[1].won || 0));
  }, [leads]);

  return (
    <GlassCard initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
      <h3 className="mb-4 text-sm font-display font-semibold text-text-primary">Rendimiento por Agente</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-subtle">
              {['Agente', 'Total', 'Activos', 'Ganados', '% Éxito'].map((h) => (
                <th key={h} className="pb-2 text-left text-[10px] font-mono uppercase tracking-wider text-text-muted font-normal">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {agents.map(([name, data], i) => (
              <motion.tr key={name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 + i * 0.04 }} className="border-b border-border-subtle/50">
                <td className="py-2.5 text-[12px] font-body font-medium text-text-secondary">{name}</td>
                <td className="py-2.5 text-[12px] font-mono text-text-muted">{data.total}</td>
                <td className="py-2.5 text-[12px] font-mono text-neon-400/70">{data.active}</td>
                <td className="py-2.5 text-[12px] font-mono text-emerald-400/80">{data.won}</td>
                <td className="py-2.5 text-[12px] font-mono font-semibold text-text-muted">
                  {data.total > 0 ? `${Math.round((data.won / data.total) * 100)}%` : '—'}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      {agents.length === 0 && (
        <p className="py-6 text-center text-[11px] text-text-muted/40 font-body">Sin datos de agentes</p>
      )}
    </GlassCard>
  );
}
