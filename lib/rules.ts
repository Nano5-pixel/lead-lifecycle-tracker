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
    'Intento': 0,
    'Contactado': 0,
    'Cita': 0,
    'Propuesta': 0,
    'Ganado': 0,
    'Perdido': 0,
    'Basura': 0,
  };

  if (!leads || !Array.isArray(leads)) {
    return {
      totalLeads: 0,
      byStage,
      conversionRate: 0,
      avgDaysInStage: 0,
      avgClosingDays: 0,
      contactEfficiency: 0,
      lostCount: 0,
      newThisWeek: 0,
      leadsByAgent: {},
      lostReasons: {},
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
  
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  for (const lead of leads) {
    if (!lead) continue;
    
    // Normalizar etapa para retrocompatibilidad
    let rawEtapa = (lead.etapa || '').toString().trim();
    if (rawEtapa === 'En Contacto') rawEtapa = 'Intento';
    if (rawEtapa === 'Calificado') rawEtapa = 'Contactado';
    
    const stageId = rawEtapa as StageId;
    if (byStage[stageId] !== undefined) byStage[stageId]++;
    
    // Motivos de pérdida
    if (stageId === 'Perdido' || stageId === 'Basura') {
      const reason = lead.motivoCaida || 'No especificado';
      lostReasons[reason] = (lostReasons[reason] || 0) + 1;
    }

    // Promedio días en etapa (general)
    const dias = Number(lead.diasEnEtapa);
    if (!isNaN(dias) && dias > 0) {
      totalDaysInStage += dias;
      countWithDays++;
    }

    // Tiempo de cierre (Nuevo -> Ganado)
    if (stageId === 'Ganado' && lead.fechaEntrada && lead.fechaUltimoCambio) {
      const start = new Date(lead.fechaEntrada).getTime();
      const end = new Date(lead.fechaUltimoCambio).getTime();
      if (!isNaN(start) && !isNaN(end) && end >= start) {
        totalClosingDays += Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        closedCount++;
      }
    }

    // Eficiencia de contacto (Moverse de Nuevo en < 24h)
    // Usamos el hecho de que si ya no está en Nuevo, fue contactado/movido
    if (stageId !== 'Nuevo') {
      contactableCount++;
      // Si se movió rápido (diasEnEtapa es pequeño y ya no es Nuevo)
      // Nota: Esto es una estimación basada en la data disponible
      if (lead.diasEnEtapa <= 1) fastContacts++;
    }

    const agent = lead.gestionadoPor || 'Sin asignar';
    if (agent !== 'Sin asignar') {
      leadsByAgent[agent] = (leadsByAgent[agent] || 0) + 1;
    }

    try {
      if (lead.fechaEntrada) {
        const created = new Date(lead.fechaEntrada);
        if (!isNaN(created.getTime()) && created >= weekAgo) {
          newThisWeek++;
        }
      }
    } catch {
      // Ignorar
    }
  }

  const totalActive = leads.length - (byStage['Perdido'] || 0) - (byStage['Basura'] || 0);
  const wonCount = byStage['Ganado'] || 0;
  const conversionRate = totalActive > 0 ? (wonCount / totalActive) * 100 : 0;
  const avgDaysInStage = countWithDays > 0 ? Math.round(totalDaysInStage / countWithDays) : 0;
  const avgClosingDays = closedCount > 0 ? Math.round(totalClosingDays / closedCount) : 0;
  const contactEfficiency = contactableCount > 0 ? Math.round((fastContacts / contactableCount) * 100) : 0;

  return {
    totalLeads: leads.length,
    byStage,
    conversionRate: isNaN(conversionRate) ? 0 : Math.round(conversionRate * 10) / 10,
    avgDaysInStage: isNaN(avgDaysInStage) ? 0 : avgDaysInStage,
    avgClosingDays,
    contactEfficiency,
    lostCount: (byStage['Perdido'] || 0) + (byStage['Basura'] || 0),
    newThisWeek,
    leadsByAgent,
    lostReasons,
  };
}
