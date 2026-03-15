import { Stage, StageId } from '@/types';

// ==============================================
// ETAPAS DEL PIPELINE (en español — como Make.com las escribe)
// ==============================================

export const STAGES: Stage[] = [
  { id: 'Nuevo', label: 'Nuevo', emoji: '📥', color: '#0A84FF' },
  { id: 'Intento', label: 'En Intento', emoji: '📞', color: '#8B5CF6' },
  { id: 'Contactado', label: 'Contactado / Cualificado', emoji: '💬', color: '#F59E0B' },
  { id: 'Cita', label: 'Cita / Demostración', emoji: '📅', color: '#10B981' },
  { id: 'Propuesta', label: 'Propuesta / Negociación', emoji: '💼', color: '#06B6D4' },
  { id: 'Ganado', label: 'Cierre Ganado', emoji: '🏆', color: '#10B981' },
  { id: 'Perdido', label: 'Cierre Perdido', emoji: '❌', color: '#EF4444' },
  { id: 'Basura', label: 'No Calificado / Basura', emoji: '🗑️', color: '#6B7280' },
];

export const STAGE_MAP: Record<StageId, Stage> = Object.fromEntries(
  STAGES.map((s) => [s.id, s])
) as Record<StageId, Stage>;

/** Todas las etapas válidas para validación */
export const VALID_STAGES: string[] = STAGES.map((s) => s.id);
