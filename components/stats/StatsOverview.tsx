import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Trophy, Zap, Target, ArrowUpRight, Calendar,
  FilterX, XCircle, TrendingDown, CheckCircle2, Trash2, Activity, HelpCircle,
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Lead, PipelineStats, StageId } from '@/types';
import { STAGES } from '@/lib/stages';
import { calculateStats } from '@/lib/rules';
import { cn } from '@/lib/utils';

// ── Tooltip — Portal que escapa de transforms de framer-motion ──
function Tooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false);
  const [domRect, setDomRect] = useState<DOMRect | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const handleEnter = useCallback(() => {
    if (btnRef.current) setDomRect(btnRef.current.getBoundingClientRect());
    setShow(true);
  }, []);

  const tooltipWidth = 220;

  const getStyle = (): React.CSSProperties => {
    if (!domRect) return {};
    let left = domRect.left + domRect.width / 2 - tooltipWidth / 2;
    const minLeft = 8;
    const maxLeft = window.innerWidth - tooltipWidth - 8;
    left = Math.max(minLeft, Math.min(left, maxLeft));
    // Position above: domRect.top gives viewport distance from top
    const bottom = window.innerHeight - domRect.top + 6;
    return { position: 'fixed', bottom, left, width: tooltipWidth, zIndex: 99999 };
  };

  return (
    <>
      <div
        className="relative inline-flex"
        onMouseEnter={handleEnter}
        onMouseLeave={() => setShow(false)}
      >
        <button
          ref={btnRef}
          type="button"
          className="flex h-5 w-5 items-center justify-center rounded-full text-text-muted/40 hover:text-text-muted transition-colors"
        >
          <HelpCircle className="h-3.5 w-3.5" />
        </button>
      </div>
      {mounted && createPortal(
        <AnimatePresence>
          {show && domRect && (
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              style={getStyle()}
              className="rounded-xl border border-white/10 bg-[#060d1f]/98 backdrop-blur-xl p-3 shadow-2xl pointer-events-none"
            >
              <p className="text-[11px] text-text-secondary leading-relaxed font-body">{text}</p>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}


interface StatsOverviewProps {
  leads: Lead[];
}

// ── Color map para etapas en los gráficos ──
const STAGE_COLOR: Partial<Record<string, string>> = {
  'Nuevo': '#94A3B8', 'Intento': '#3B82F6', 'Contactado': '#8B5CF6',
  'Cita': '#F59E0B', 'Propuesta': '#10B981', 'Ganado': '#22C55E',
  'Perdido': '#EF4444', 'Basura': '#6B7280',
};

const FUNNEL_STEPS = [
  { key: 'Nuevo→Intento',      label: 'Nuevo → Intento',       color: '#3B82F6' },
  { key: 'Intento→Contactado', label: 'Intento → Contactado',  color: '#8B5CF6' },
  { key: 'Contactado→Cita',    label: 'Contactado → Cita',     color: '#F59E0B' },
  { key: 'Cita→Propuesta',     label: 'Cita → Propuesta',      color: '#10B981' },
  { key: 'Propuesta→Ganado',   label: 'Propuesta → Ganado',    color: '#22C55E' },
  { key: 'Lead→Ganado',        label: 'Lead Total → Ganado',   color: '#0A84FF' },
];

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

  const clearFilters = () => { setDateFrom(''); setDateTo(''); };

  return (
    <div className="space-y-6 pb-20">

      {/* ── Date Filters ── */}
      <div className="flex flex-wrap items-center gap-4 rounded-2xl bg-white/[0.04] border border-border-subtle p-4 glass-subtle">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-neon-500" />
          <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted">Rango de Fecha:</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-text-muted font-body">Desde:</span>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
              className="bg-black/20 border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-neon-500/50"
              style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', colorScheme: 'dark' }} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-text-muted font-body">Hasta:</span>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
              className="bg-black/20 border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-neon-500/50"
              style={{ colorScheme: 'dark' }} />
          </div>
          {(dateFrom || dateTo) && (
            <button onClick={clearFilters}
              className="flex items-center gap-1.5 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-1.5 text-[10px] font-semibold text-red-400 hover:bg-red-500/20 transition-colors">
              <FilterX className="h-3.5 w-3.5" /> Limpiar
            </button>
          )}
        </div>
        <div className="ml-auto text-[11px] text-text-muted font-body">
          Mostrando <span className="text-neon-400 font-mono font-bold">{filteredLeads.length}</span> de <span className="font-mono">{leads.length}</span> leads
        </div>
      </div>

      {/* ── Sección 1: Métricas Generales ── */}
      <SectionHeader label="Métricas Generales" icon={Activity} tooltip="Contadores globales del estado actual de tu pipeline. Te dan una foto instantánea de cuántos leads tienes en cada categoría." />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5 lg:gap-4">
        <KPICard icon={Users}        label="Total Ingresados"  value={String(stats.totalLeads)}  subtext={`+${stats.newThisWeek} esta semana`} color="#0A84FF" delay={0}    tooltip="Todos los leads que han entrado al sistema, sin excepción. Incluye activos, ganados, perdidos y basura." />
        <KPICard icon={Zap}          label="Leads Activos"     value={String(stats.activeLeads)} subtext="en el pipeline ahora" color="#8B5CF6" delay={0.05}  tooltip="Leads que siguen en el proceso de venta (no han sido marcados como Ganado, Perdido o Basura)." />
        <KPICard icon={CheckCircle2} label="Leads Ganados"     value={String(stats.wonLeads)}    subtext="cierres confirmados" color="#22C55E" delay={0.1}   tooltip="Leads que llegaron a la etapa 'Ganado'. Representa tus cierres comerciales exitosos." />
        <KPICard icon={XCircle}      label="Leads Perdidos"    value={String(stats.lostLeads)}   subtext="no pudimos cerrar" color="#EF4444" delay={0.15}  tooltip="Leads que estaban interesados pero no pudimos cerrar. Se perdieron frente a la competencia, por precio u otras razones comerciales." />
        <KPICard icon={Trash2}       label="No Calificados"    value={String(stats.junkLeads)}   subtext="descartados / basura" color="#6B7280" delay={0.2}   tooltip="Leads que no eran el perfil adecuado: números falsos, personas buscando empleo, bots, etc. Indica la calidad del targeting de tus campañas." />
      </div>

      {/* ── Sección 2: KPIs de Eficiencia ── */}
      <SectionHeader label="KPIs de Eficiencia" icon={Zap} tooltip="Indicadores que miden la calidad y velocidad de tu proceso comercial. Úsalos para identificar cuellos de botella." />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <KPICard icon={Target}       label="Conversión Real"    value={`${stats.conversionRate}%`}  subtext="leads totales → ganados" color="#F59E0B" delay={0.25} tooltip="Porcentaje de todos los leads ingresados que terminaron en un cierre. Es tu métrica de efectividad global." />
        <KPICard icon={Trophy}       label="Tiempo de Cierre"   value={`${stats.avgClosingDays}d`}   subtext="promedio nuevo → ganado" color="#10B981" delay={0.3}  tooltip="Días promedio que tarda un lead en pasar de 'Nuevo' a 'Ganado'. Mientras más bajo, más ágil es tu proceso." />
        <KPICard icon={Zap}          label="Eficiencia Inicial" value={`${stats.contactEfficiency}%`} subtext="contactados en < 24h"    color="#3B82F6" delay={0.35} tooltip="Porcentaje de leads que fueron contactados (movidos de 'Nuevo') en menos de 24 horas. Mide la velocidad de reacción de tu equipo." />
        <KPICard icon={TrendingDown} label="Tasa de Pérdida"   value={`${stats.totalLeads > 0 ? Math.round(((stats.lostLeads + stats.junkLeads) / stats.totalLeads) * 100) : 0}%`} subtext="perdidos + no calificados" color="#EF4444" delay={0.4} tooltip="Porcentaje de leads que no generaron valor (Perdidos + Basura) sobre el total ingresado. Una tasa alta puede indicar problema en campañas o en el proceso de cierre." />
      </div>

      {/* ── Sección 3: Embudo de Conversión ── */}
      <SectionHeader label="Embudo de Conversión" icon={Target} tooltip="Muestra cuántos leads pasan de una etapa a la siguiente. Te ayuda a detectar en qué punto exacto se atoran o se pierden los prospectos." />
      <div className="grid gap-4 lg:grid-cols-2">
        <FunnelChart stats={stats} />
        <ConversionRates stats={stats} />
      </div>

      {/* ── Sección 4: Métricas de Pérdida ── */}
      <SectionHeader label="Análisis de Pérdidas" icon={TrendingDown} tooltip="Desglosa dónde y por qué se pierden los leads. Esencial para corregir el proceso comercial y mejorar la calificación de campañas." />
      <div className="grid gap-4 lg:grid-cols-3">
        <AbandonmentByStage stats={stats} />
        <LostReasonBreakdown title="Motivos de Pérdida" motivos={stats.lostMotivos} color="#EF4444" tooltip="Razones por las que leads interesados no cerraron. Ayuda a ajustar propuestas, precios y estrategias de seguimiento." />
        <LostReasonBreakdown title="Motivos de Descalificación" motivos={stats.junkMotivos} color="#6B7280" tooltip="Razones por las que leads fueron marcados como Basura. Indica problemas en el targeting de tus campañas publicitarias." />
      </div>

      {/* ── Sección 5: Rendimiento por Agente ── */}
      <SectionHeader label="Rendimiento por Agente" icon={Users} tooltip="Compara la efectividad individual de cada asesor comercial. Útil para identificar top performers y quién necesita más soporte." />
      <AgentPerformance leads={filteredLeads} />

    </div>
  );
}

// ── Sub-componentes ──

function SectionHeader({ label, icon: Icon, tooltip }: { label: string; icon: any; tooltip?: string }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-neon-500/10">
        <Icon className="h-4 w-4 text-neon-500" />
      </div>
      <h2 className="text-[13px] font-display font-bold text-white uppercase tracking-widest">{label}</h2>
      {tooltip && <Tooltip text={tooltip} />}
      <div className="flex-1 h-px bg-white/[0.05]" />
    </div>
  );
}

function FunnelChart({ stats }: { stats: PipelineStats }) {
  const stages = STAGES.filter(s => !['Perdido', 'Basura'].includes(s.id));
  const maxCount = Math.max(...stages.map(s => stats.byStage[s.id] || 0), 1);

  return (
    <GlassCard initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-display font-semibold text-white">Distribución por Etapa</h3>
        <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">activos</span>
      </div>
      <div className="space-y-2.5">
        {stages.map((stage, i) => {
          const count = stats.byStage[stage.id] || 0;
          const pct = (count / maxCount) * 100;
          return (
            <motion.div key={stage.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.04 }} className="flex items-center gap-3">
              <span className="w-5 text-center text-sm">{stage.emoji}</span>
              <span className="w-24 text-[11px] font-body text-text-secondary truncate">{stage.label}</span>
              <div className="flex-1 h-7 rounded-lg bg-white/[0.04] border border-border-subtle overflow-hidden relative">
                <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                  transition={{ delay: 0.55 + i * 0.05, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-y-0 left-0 rounded-lg"
                  style={{ background: `linear-gradient(90deg, ${stage.color}30, ${stage.color}60)`, borderRight: `2px solid ${stage.color}` }} />
                <span className="relative z-10 flex h-full items-center pl-3 text-[11px] font-mono font-bold text-white/70">{count}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </GlassCard>
  );
}

function ConversionRates({ stats }: { stats: PipelineStats }) {
  return (
    <GlassCard initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-display font-semibold text-white">Tasas de Conversión</h3>
        <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">por paso</span>
      </div>
      <div className="space-y-4">
        {FUNNEL_STEPS.map((step, i) => {
          const rate = stats.funnelRates[step.key] ?? 0;
          const isTotal = step.key === 'Lead→Ganado';
          return (
            <div key={step.key}>
              <div className="flex justify-between mb-1.5">
                <span className={cn("text-[11px] font-body", isTotal ? "text-white font-bold" : "text-text-secondary")}>{step.label}</span>
                <span className="text-[12px] font-mono font-bold" style={{ color: step.color }}>{rate}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-white/[0.04] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(rate, 100)}%` }}
                  transition={{ delay: 0.55 + i * 0.06, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${step.color}60, ${step.color})` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}

function AbandonmentByStage({ stats }: { stats: PipelineStats }) {
  const entries = Object.entries(stats.abandonmentByStage).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((acc, [, v]) => acc + v, 0) || 1;

  return (
    <GlassCard initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-display font-semibold text-white">Abandono por Fase</h3>
        <TrendingDown className="h-4 w-4 text-amber-500/50" />
      </div>
      {entries.length > 0 ? (
        <div className="space-y-3">
          {entries.map(([stage, count], i) => {
            const color = STAGE_COLOR[stage] || '#94A3B8';
            return (
              <div key={stage} className="space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-text-secondary font-medium flex items-center gap-1.5">
                    <span>{STAGES.find(s => s.id === stage)?.emoji}</span> {stage}
                  </span>
                  <span className="font-mono text-text-muted">{count} leads</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-white/[0.04] overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(count / total) * 100}%` }}
                    transition={{ delay: 0.65 + i * 0.05, duration: 0.8 }}
                    className="h-full rounded-full" style={{ backgroundColor: color }} />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-10 text-center space-y-2">
          <p className="text-[11px] text-text-muted/40 font-body">No hay datos suficientes aún</p>
          <p className="text-[10px] text-text-muted/25 font-body">Los datos se acumularán cuando los leads sean movidos a Perdido/Basura</p>
        </div>
      )}
    </GlassCard>
  );
}

function LostReasonBreakdown({ title, motivos, color, tooltip }: { title: string; motivos: Record<string, number>; color: string; tooltip?: string }) {
  const entries = Object.entries(motivos).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((acc, [, v]) => acc + v, 0) || 1;

  return (
    <GlassCard initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-display font-semibold text-white">{title}</h3>
          {tooltip && <Tooltip text={tooltip} />}
        </div>
        <XCircle className="h-4 w-4" style={{ color: `${color}80` }} />
      </div>
      {entries.length > 0 ? (
        <div className="space-y-3">
          {entries.map(([reason, count], i) => (
            <div key={reason} className="space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="text-text-secondary font-medium truncate max-w-[140px]">{reason}</span>
                <span className="font-mono text-text-muted ml-2">{count}</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-white/[0.04] overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${(count / total) * 100}%` }}
                  transition={{ delay: 0.7 + i * 0.05, duration: 0.8 }}
                  className="h-full rounded-full" style={{ backgroundColor: `${color}60` }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-10 text-center text-[11px] text-text-muted/40 font-body">Sin datos de este tipo</div>
      )}
    </GlassCard>
  );
}

function KPICard({ icon: Icon, label, value, subtext, color, delay, tooltip }: {
  icon: any; label: string; value: string; subtext: string; color: string; delay: number; tooltip?: string;
}) {
  return (
    <GlassCard hoverGlow glowColor={`${color}15`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${color}15` }}>
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
        {tooltip ? <Tooltip text={tooltip} /> : <ArrowUpRight className="h-4 w-4 text-text-muted/30" />}
      </div>
      <div className="text-2xl font-display font-bold text-white tracking-tight">{value}</div>
      <div className="mt-0.5 text-[11px] font-body text-text-secondary">{label}</div>
      <div className="mt-2 text-[10px] font-body text-text-muted">{subtext}</div>
    </GlassCard>
  );
}

function AgentPerformance({ leads }: { leads: Lead[] }) {
  const agents = useMemo(() => {
    const map: Record<string, { total: number; won: number; active: number; lost: number }> = {};
    leads.forEach((l) => {
      const agent = l.gestionadoPor;
      if (!agent) return;
      if (!map[agent]) map[agent] = { total: 0, won: 0, active: 0, lost: 0 };
      map[agent].total++;
      if (l.etapa === 'Ganado') map[agent].won++;
      if (l.etapa === 'Perdido' || l.etapa === 'Basura') map[agent].lost++;
      if (!['Ganado', 'Perdido', 'Basura'].includes(l.etapa)) map[agent].active++;
    });
    return Object.entries(map).sort((a, b) => b[1].won - a[1].won);
  }, [leads]);

  return (
    <GlassCard initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75 }}>
      <h3 className="mb-4 text-sm font-display font-semibold text-white">Rendimiento por Asesor</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              {['Agente', 'Total', 'Activos', 'Ganados', 'Perdidos', 'Efectividad'].map((h) => (
                <th key={h} className="pb-3 text-left text-[10px] font-mono uppercase tracking-wider text-text-muted font-normal">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.02]">
            {agents.map(([name, data]) => (
              <tr key={name} className="group">
                <td className="py-4 text-[13px] font-display font-medium text-white">{name}</td>
                <td className="py-4 text-xs font-mono text-text-muted">{data.total}</td>
                <td className="py-4 text-xs font-mono text-blue-400">{data.active}</td>
                <td className="py-4 text-xs font-mono text-emerald-400">{data.won}</td>
                <td className="py-4 text-xs font-mono text-red-400">{data.lost}</td>
                <td className="py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-text-secondary">
                      {data.total > 0 ? Math.round((data.won / data.total) * 100) : 0}%
                    </span>
                    <div className="h-1 w-12 rounded-full bg-white/5 overflow-hidden hidden sm:block">
                      <div className="h-full bg-emerald-500 transition-all" style={{ width: `${data.total > 0 ? (data.won / data.total) * 100 : 0}%` }} />
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {agents.length === 0 && <p className="py-10 text-center text-xs text-text-muted font-body italic">No hay datos de rendimiento disponibles</p>}
    </GlassCard>
  );
}
