'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Lead, StageId, StageTransitionRequest } from '@/types';
import { validateStageTransition } from '@/lib/rules';
import { VALID_STAGES } from '@/lib/stages';
import { useAuth } from './useAuth';

// ==============================================
// HOOK DE LEADS — Tiempo real con Firestore
// ==============================================

export function useLeads() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ruta en Firestore según el rol del usuario
  const getLeadsPath = useCallback(() => {
    if (!user) return null;

    if (user.rol === 'cliente' && user.agenciaId && user.clienteId) {
      return `agencias/${user.agenciaId}/clientes/${user.clienteId}/leads`;
    }
    // Agencias ven leads del cliente seleccionado (se pasa por parámetro)
    return null;
  }, [user]);

  // Suscripción a leads en tiempo real
  useEffect(() => {
    const path = getLeadsPath();
    if (!path) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const leadsRef = collection(db, path);
    // Filtrar por no archivados por defecto
    const q = query(leadsRef);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const leadsData: Lead[] = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((l: any) => !l.archivado) as Lead[];
        
        // Sort client-side instead
        leadsData.sort((a, b) => {
          const dateA = new Date(a.fechaEntrada || 0).getTime();
          const dateB = new Date(b.fechaEntrada || 0).getTime();
          return dateB - dateA;
        });

        setLeads(leadsData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error escuchando leads:', err);
        setError('Error cargando leads.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [getLeadsPath]);

  // Mover lead a otra etapa
  const moveLeadToStage = useCallback(
    async (
      lead: Lead,
      toStage: StageId
    ): Promise<{ success: boolean; error?: string }> => {
      if (!user) return { success: false, error: 'No autenticado' };
      if (!VALID_STAGES.includes(toStage)) {
        return { success: false, error: 'Etapa no válida' };
      }

      // Validar reglas de negocio
      const req: StageTransitionRequest = {
        leadId: lead.id,
        fromStage: lead.etapa,
        toStage,
        lead,
      };
      const validation = validateStageTransition(req);
      if (!validation.success) {
        return { success: false, error: validation.error };
      }

      // Actualizar en Firestore
      try {
        const path = getLeadsPath();
        if (!path) return { success: false, error: 'Ruta no encontrada' };

        const leadRef = doc(db, path, lead.id);
        const updates: any = {
          etapa: toStage,
          fechaUltimoCambio: new Date().toISOString(),
          diasEnEtapa: 0,
        };

        // Persistir el motivo si viene en el objeto lead (usado por LostReasonModal)
        if (lead.motivoCaida) {
          updates.motivoCaida = lead.motivoCaida;
        }

        await updateDoc(leadRef, updates);

        return { success: true };
      } catch (err) {
        console.error('Error moviendo lead:', err);
        return { success: false, error: 'Error al actualizar el lead.' };
      }
    },
    [user, getLeadsPath]
  );

  // Actualizar campos de un lead
  const updateLead = useCallback(
    async (leadId: string, fields: Partial<Lead>): Promise<boolean> => {
      try {
        const path = getLeadsPath();
        if (!path) return false;

        const leadRef = doc(db, path, leadId);
        await updateDoc(leadRef, {
          ...fields,
          fechaUltimoCambio: new Date().toISOString(),
        });
        return true;
      } catch (err) {
        console.error('Error actualizando lead:', err);
        return false;
      }
    },
    [getLeadsPath]
  );

  // Archivar lead
  const archiveLead = useCallback(
    async (leadId: string, archivado: boolean): Promise<boolean> => {
      try {
        const path = getLeadsPath();
        if (!path) return false;
        const leadRef = doc(db, path, leadId);
        await updateDoc(leadRef, { archivado, fechaUltimoCambio: new Date().toISOString() });
        return true;
      } catch (err) {
        console.error('Error archivando lead:', err);
        return false;
      }
    },
    [getLeadsPath]
  );

  // Eliminar lead permanentemente
  const deleteLead = useCallback(
    async (leadId: string): Promise<boolean> => {
      try {
        const path = getLeadsPath();
        if (!path) return false;
        const leadRef = doc(db, path, leadId);
        const { deleteDoc: fsDeleteDoc } = await import('firebase/firestore');
        await fsDeleteDoc(leadRef);
        return true;
      } catch (err) {
        console.error('Error eliminando lead:', err);
        return false;
      }
    },
    [getLeadsPath]
  );

  // Crear lead manualmente
  const createLead = useCallback(
    async (leadData: Partial<Lead>): Promise<boolean> => {
      try {
        const path = getLeadsPath();
        if (!path) return false;

        const leadsRef = collection(db, path);
        await addDoc(leadsRef, {
          nombre: leadData.nombre || '',
          telefono: leadData.telefono || '',
          email: leadData.email || '',
          fuente: leadData.fuente || '',
          etapa: 'Nuevo',
          motivoCaida: '',
          notas: leadData.notas || '',
          fechaEntrada: new Date().toISOString(),
          fechaUltimoCambio: new Date().toISOString(),
          diasEnEtapa: 0,
          gestionadoPor: leadData.gestionadoPor || '',
        });
        return true;
      } catch (err) {
        console.error('Error creando lead:', err);
        return false;
      }
    },
    [getLeadsPath]
  );

  return {
    leads,
    loading,
    error,
    moveLeadToStage,
    updateLead,
    createLead,
    archiveLead,
    deleteLead,
  };
}

// ==============================================
// HOOK PARA AGENCIAS — Escuchar leads de un cliente específico
// ==============================================

export function useLeadsForClient(agenciaId: string, clienteId: string) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!agenciaId || !clienteId) {
      setLoading(false);
      return;
    }

    const path = `agencias/${agenciaId}/clientes/${clienteId}/leads`;
    const leadsRef = collection(db, path);
    const q = query(leadsRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Lead[] = snapshot.docs
        .map((d) => ({
          id: d.id,
          ...d.data(),
        }))
        .filter((l: any) => !l.archivado) as Lead[];

      // Sort client-side
      data.sort((a, b) => {
        const dateA = new Date(a.fechaEntrada || 0).getTime();
        const dateB = new Date(b.fechaEntrada || 0).getTime();
        return dateB - dateA;
      });

      setLeads(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [agenciaId, clienteId]);

  return { leads, loading };
}
