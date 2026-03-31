import {
  Lead,
  StageId,
  StageTransitionRequest,
  StageTransitionResult,
  PipelineStats,
} from '@/types';

// ==============================================
// MOTOR DE REGLAS DE NEGOCIO
// ==============================================

/** Ejecutar todas las reglas */
export function validateStageTransition(req: StageTransitionRequest): StageTransitionResult {
  // Se eliminan restricciones para permitir libertad total de movimiento al cliente
  return { success: true };
}

/** Calcular estadísticas del pipeline */
export function calculateStats(leads: Lead[]): PipelineStats {
  const byStage: Record<StageId, number> = {
    'Nuevo': 0, 'Intento': 0, 'Contactado': 0, 'Cita': 0,
    'Propuesta': 0, 'Ganado': 0, 'Perdido': 0, 'Basura': 0,
  };

  if (!leads || !Array.isArray(leads)) {
    return {
      totalLeads: 0, byStage,
      conversionRate: 0, avgDaysInStage: 0, avgClosingDays: 0,
      contactEfficiency: 0, lostCount: 0, newThisWeek: 0,
      leadsByAgent: {}, lostReasons: {},
      activeLeads: 0, wonLeads: 0, lostLeads: 0, junkLeads: 0,
      funnelRates: {}, abandonmentByStage: {}, lostMotivos: {}, junkMotivos: {},
    };
  }

  let newThisWeek = 0;
  let totalDaysInStage = 0;
  let countWithDays = 0;
  let totalClosingDays = 0;
  let closedCount = 0;
  let fastContacts = 0;
  let contactableCount = 0;

  const leadsByAgent: Record<string, number> = {};
  const lostReasons: Record<string, number> = {};
  const lostMotivos: Record<string, number> = {};
  const junkMotivos: Record<string, number> = {};
  const abandonmentByStage: Record<string, number> = {};

  let countIntento = 0, countContactado = 0, countCita = 0, countPropuesta = 0, countGanado = 0;

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  for (const lead of leads) {
    if (!lead) continue;

    let rawEtapa = (lead.etapa || '').toString().trim();
    if (rawEtapa === 'En Contacto') rawEtapa = 'Intento';
    if (rawEtapa === 'Calificado') rawEtapa = 'Contactado';
    const stageId = rawEtapa as StageId;
    if (byStage[stageId] !== undefined) byStage[stageId]++;

    // ── Contadores de hitos del embudo (timestamp real > modelo acumulativo) ──
    if (lead.fechaIntento || ['Intento','Contactado','Cita','Propuesta','Ganado','Perdido','Basura'].includes(stageId)) countIntento++;
    if (lead.fechaContactado || ['Contactado','Cita','Propuesta','Ganado'].includes(stageId)) countContactado++;
    if (lead.fechaCita || ['Cita','Propuesta','Ganado'].includes(stageId)) countCita++;
    if (lead.fechaPropuesta || ['Propuesta','Ganado'].includes(stageId)) countPropuesta++;
    if (lead.fechaGanado || stageId === 'Ganado') countGanado++;

    // ── Motivos de pérdida separados ──
    if (stageId === 'Perdido') {
      const r = lead.motivoCaida || 'No especificado';
      lostReasons[r] = (lostReasons[r] || 0) + 1;
      lostMotivos[r] = (lostMotivos[r] || 0) + 1;
    }
    if (stageId === 'Basura') {
      const r = lead.motivoCaida || 'No especificado';
      lostReasons[r] = (lostReasons[r] || 0) + 1;
      junkMotivos[r] = (junkMotivos[r] || 0) + 1;
    }

    // ── Abandono por fase ──
    if ((stageId === 'Perdido' || stageId === 'Basura') && lead.etapaCaida) {
      abandonmentByStage[lead.etapaCaida] = (abandonmentByStage[lead.etapaCaida] || 0) + 1;
    }

    const dias = Number(lead.diasEnEtapa);
    if (!isNaN(dias) && dias > 0) { totalDaysInStage += dias; countWithDays++; }

    if (stageId === 'Ganado' && lead.fechaEntrada && lead.fechaUltimoCambio) {
      const start = new Date(lead.fechaEntrada).getTime();
      const end = new Date(lead.fechaUltimoCambio).getTime();
      if (!isNaN(start) && !isNaN(end) && end >= start) {
        totalClosingDays += Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        closedCount++;
      }
    }

    if (stageId !== 'Nuevo') {
      contactableCount++;
      if (lead.diasEnEtapa <= 1) fastContacts++;
    }

    const agent = lead.gestionadoPor || 'Sin asignar';
    if (agent !== 'Sin asignar') leadsByAgent[agent] = (leadsByAgent[agent] || 0) + 1;

    try {
      if (lead.fechaEntrada) {
        const created = new Date(lead.fechaEntrada);
        if (!isNaN(created.getTime()) && created >= weekAgo) newThisWeek++;
      }
    } catch { /* Ignorar */ }
  }

  const total = leads.length;
  const activeLeads = total - (byStage['Perdido'] || 0) - (byStage['Basura'] || 0);
  const wonLeads = byStage['Ganado'] || 0;
  const lostLeads = byStage['Perdido'] || 0;
  const junkLeads = byStage['Basura'] || 0;
  const conversionRate = total > 0 ? (wonLeads / total) * 100 : 0;
  const avgDaysInStage = countWithDays > 0 ? Math.round(totalDaysInStage / countWithDays) : 0;
  const avgClosingDays = closedCount > 0 ? Math.round(totalClosingDays / closedCount) : 0;
  const contactEfficiency = contactableCount > 0 ? Math.round((fastContacts / contactableCount) * 100) : 0;

  const pct = (num: number, den: number) => den > 0 ? Math.round((num / den) * 1000) / 10 : 0;
  const funnelRates: Record<string, number> = {
    'Nuevo→Intento':      pct(countIntento, total),
    'Intento→Contactado': pct(countContactado, countIntento),
    'Contactado→Cita':    pct(countCita, countContactado),
    'Cita→Propuesta':     pct(countPropuesta, countCita),
    'Propuesta→Ganado':   pct(countGanado, countPropuesta),
    'Lead→Ganado':        pct(wonLeads, total),
  };

  return {
    totalLeads: total, byStage,
    conversionRate: isNaN(conversionRate) ? 0 : Math.round(conversionRate * 10) / 10,
    avgDaysInStage: isNaN(avgDaysInStage) ? 0 : avgDaysInStage,
    avgClosingDays, contactEfficiency,
    lostCount: lostLeads + junkLeads,
    newThisWeek, leadsByAgent, lostReasons,
    activeLeads, wonLeads, lostLeads, junkLeads,
    funnelRates, abandonmentByStage, lostMotivos, junkMotivos,
  };
}
