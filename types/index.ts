// ==============================================
// LEAD LIFECYCLE TRACKER v2 — TIPOS
// ==============================================

/** Las 6 etapas universales del pipeline */
export type StageId =
  | 'Nuevo'
  | 'En Contacto'
  | 'Calificado'
  | 'Propuesta'
  | 'Ganado'
  | 'Perdido';

export interface Stage {
  id: StageId;
  label: string;
  emoji: string;
  color: string;
}

/** Roles del sistema */
export type UserRole = 'super_admin' | 'agencia' | 'cliente';

/** Usuario autenticado con datos de Firestore */
export interface AppUser {
  uid: string;
  email: string;
  nombre: string;
  rol: UserRole;
  agenciaId: string;
  clienteId: string;
}

/** Lead en Firestore */
export interface Lead {
  id: string;
  nombre: string;
  telefono: string;
  email: string;
  fuente: string;
  etapa: StageId;
  motivoCaida: string;
  notas: string;
  fechaEntrada: string;
  fechaUltimoCambio: string;
  diasEnEtapa: number;
  gestionadoPor: string;
}

/** Agencia en Firestore */
export interface Agencia {
  id: string;
  nombre: string;
  email: string;
  plan: string;
  estadoLicencia: 'activo' | 'inactivo';
  apiKey: string;
  creadoEn: string;
  creadoPor: string;
}

/** Cliente dentro de una agencia */
export interface Cliente {
  id: string;
  nombre: string;
  fuente: string;
  creadoEn: string;
}

/** Request de transición de etapa */
export interface StageTransitionRequest {
  leadId: string;
  fromStage: StageId;
  toStage: StageId;
  lead: Lead;
}

/** Resultado de validación de reglas */
export interface StageTransitionResult {
  success: boolean;
  error?: string;
  ruleViolation?: string;
}

/** Estadísticas del pipeline */
export interface PipelineStats {
  totalLeads: number;
  byStage: Record<StageId, number>;
  conversionRate: number;
  avgDaysInStage: number;
  lostCount: number;
  newThisWeek: number;
  leadsByAgent: Record<string, number>;
}

/** Payload de ingesta desde Make.com */
export interface IngestPayload {
  apiKey: string;
  clienteId: string;
  nombre: string;
  telefono: string;
  email?: string;
  fuente?: string;
  notas?: string;
  gestionadoPor?: string;
}
