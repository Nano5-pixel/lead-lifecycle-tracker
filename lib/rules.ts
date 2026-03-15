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

/** No revertir desde Ganado */
function ruleNoRevertFromGanado(req: StageTransitionRequest): StageTransitionResult {
  if (req.fromStage === 'Ganado' && req.toStage !== 'Ganado') {
    return {
      success: false,
      error: 'Un lead Ganado no puede ser revertido. Contacta al administrador.',
    };
  }
  return { success: true };
}

/** Ejecutar todas las reglas */
export function validateStageTransition(req: StageTransitionRequest): StageTransitionResult {
  const rules = [ruleNoRevertFromGanado];
  for (const rule of rules) {
    const result = rule(req);
    if (!result.success) return result;
  }
  return { success: true };
}

/** Calcular estadísticas del pipeline */
export function calculateStats(leads: Lead[]): PipelineStats {
  const byStage: Record<StageId, number> = {
    'Nuevo': 0,
    'En Contacto': 0,
    'Calificado': 0,
    'Propuesta': 0,
    'Ganado': 0,
    'Perdido': 0,
  };

  let newThisWeek = 0;
  let totalDays = 0;
  let countWithDays = 0;
  const leadsByAgent: Record<string, number> = {};
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  for (const lead of leads) {
    if (byStage[lead.etapa] !== undefined) byStage[lead.etapa]++;
    if (lead.diasEnEtapa > 0) { totalDays += lead.diasEnEtapa; countWithDays++; }
    const agent = lead.gestionadoPor || 'Sin asignar';
    leadsByAgent[agent] = (leadsByAgent[agent] || 0) + 1;
    const created = new Date(lead.fechaEntrada);
    if (created >= weekAgo) newThisWeek++;
  }

  const totalActive = leads.filter((l) => l.etapa !== 'Perdido').length;
  const wonCount = byStage['Ganado'];
  const conversionRate = totalActive > 0 ? (wonCount / totalActive) * 100 : 0;
  const avgDaysInStage = countWithDays > 0 ? Math.round(totalDays / countWithDays) : 0;

  return {
    totalLeads: leads.length,
    byStage,
    conversionRate: Math.round(conversionRate * 10) / 10,
    avgDaysInStage,
    lostCount: byStage['Perdido'],
    newThisWeek,
    leadsByAgent,
  };
}
