'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Agencia } from '@/types';
import { generateApiKey } from '@/lib/utils';
import { useAuth } from './useAuth';

export function useAgencias() {
  const { user } = useAuth();
  const [agencias, setAgencias] = useState<Agencia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.rol !== 'super_admin') {
      setLoading(false);
      return;
    }

    const agenciasRef = collection(db, 'agencias');
    const q = query(agenciasRef, orderBy('creadoEn', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Agencia[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Agencia[];
      setAgencias(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const createAgencia = useCallback(
    async (nombre: string, email: string, plan: string): Promise<string | null> => {
      if (!user || user.rol !== 'super_admin') return null;
      try {
        const ref = collection(db, 'agencias');
        const d = await addDoc(ref, {
          nombre,
          email,
          plan,
          estadoLicencia: 'activo',
          apiKey: generateApiKey(),
          creadoEn: new Date().toISOString(),
          creadoPor: user.uid,
        });
        return d.id;
      } catch (err) {
        console.error('Error creando agencia:', err);
        return null;
      }
    },
    [user]
  );

  const toggleLicencia = useCallback(
    async (agenciaId: string, currentStatus: string): Promise<boolean> => {
      try {
        const ref = doc(db, 'agencias', agenciaId);
        const newStatus = currentStatus === 'activo' ? 'inactivo' : 'activo';
        await updateDoc(ref, { estadoLicencia: newStatus });
        return true;
      } catch (err) {
        console.error('Error cambiando licencia:', err);
        return false;
      }
    },
    []
  );

  const updateAgencia = useCallback(
    async (agenciaId: string, data: Partial<Agencia>): Promise<boolean> => {
      try {
        const ref = doc(db, 'agencias', agenciaId);
        await updateDoc(ref, data);
        return true;
      } catch (err) {
        console.error('Error actualizando agencia:', err);
        return false;
      }
    },
    []
  );

  const deleteAgencia = useCallback(
    async (agenciaId: string): Promise<boolean> => {
      try {
        const { deleteDoc } = await import('firebase/firestore');
        const ref = doc(db, 'agencias', agenciaId);
        await deleteDoc(ref);
        return true;
      } catch (err) {
        console.error('Error eliminando agencia:', err);
        return false;
      }
    },
    []
  );

  return { agencias, loading, createAgencia, toggleLicencia, updateAgencia, deleteAgencia };
}
