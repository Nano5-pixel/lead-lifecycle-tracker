import { Stage, StageId } from '@/types';

// ==============================================
// ETAPAS DEL PIPELINE (en español — como Make.com las escribe)
// ==============================================

export const STAGES: Stage[] = [
  { id: 'Nuevo', label: 'Nuevo', emoji: '⚡', color: '#0A84FF' },
  { id: 'En Contacto', label: 'En Contacto', emoji: '⏳', color: '#F59E0B' },
  { id: 'Calificado', label: 'Calificado', emoji: '📞', color: '#8B5CF6' },
  { id: 'Propuesta', label: 'Propuesta / Cita', emoji: '📄', color: '#06B6D4' },
  { id: 'Ganado', label: 'Ganado', emoji: '🏆', color: '#10B981' },
  { id: 'Perdido', label: 'Perdido', emoji: '❌', color: '#EF4444' },
];

export const STAGE_MAP: Record<StageId, Stage> = Object.fromEntries(
  STAGES.map((s) => [s.id, s])
) as Record<StageId, Stage>;

/** Todas las etapas válidas para validación */
export const VALID_STAGES: string[] = STAGES.map((s) => s.id);
