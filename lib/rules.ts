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
    'Nuevo': 0,
    'En Contacto': 0,
    'Calificado': 0,
    'Propuesta': 0,
    'Ganado': 0,
    'Perdido': 0,
  };

  if (!leads || !Array.isArray(leads)) {
    return {
      totalLeads: 0,
      byStage,
      conversionRate: 0,
      avgDaysInStage: 0,
      lostCount: 0,
      newThisWeek: 0,
      leadsByAgent: {},
    };
  }

  let newThisWeek = 0;
  let totalDays = 0;
  let countWithDays = 0;
  const leadsByAgent: Record<string, number> = {};
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  for (const lead of leads) {
    if (!lead) continue;
    if (byStage[lead.etapa] !== undefined) byStage[lead.etapa]++;
    
    const dias = Number(lead.diasEnEtapa);
    if (!isNaN(dias) && dias > 0) {
      totalDays += dias;
      countWithDays++;
    }

    const agent = lead.gestionadoPor || 'Sin asignar';
    leadsByAgent[agent] = (leadsByAgent[agent] || 0) + 1;

    try {
      if (lead.fechaEntrada) {
        const created = new Date(lead.fechaEntrada);
        if (!isNaN(created.getTime()) && created >= weekAgo) {
          newThisWeek++;
        }
      }
    } catch {
      // Ignorar errores de fecha malformada
    }
  }

  const totalActive = leads.length - (byStage['Perdido'] || 0);
  const wonCount = byStage['Ganado'] || 0;
  const conversionRate = totalActive > 0 ? (wonCount / totalActive) * 100 : 0;
  const avgDaysInStage = countWithDays > 0 ? Math.round(totalDays / countWithDays) : 0;

  return {
    totalLeads: leads.length,
    byStage,
    conversionRate: isNaN(conversionRate) ? 0 : Math.round(conversionRate * 10) / 10,
    avgDaysInStage: isNaN(avgDaysInStage) ? 0 : avgDaysInStage,
    lostCount: byStage['Perdido'] || 0,
    newThisWeek,
    leadsByAgent,
  };
}
