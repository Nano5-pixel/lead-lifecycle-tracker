'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Cliente } from '@/types';
import { useAuth } from './useAuth';

export function useClientes(agenciaIdOverride?: string) {
  const { user } = useAuth();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Si no hay usuario, o si no hay agenciaId (ni override ni del usuario), salimos.
    const finalAgenciaId = agenciaIdOverride || user?.agenciaId;
    
    if (!user || !finalAgenciaId) {
      setLoading(false);
      return;
    }

    // El super_admin puede ver cualquier agencia si se pasa el override.
    // La agencia solo puede ver la suya.
    if (user.rol !== 'super_admin' && user.rol !== 'agencia') {
      setLoading(false);
      return;
    }

    const path = `agencias/${finalAgenciaId}/clientes`;
    const clientesRef = collection(db, path);
    const q = query(clientesRef, orderBy('creadoEn', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Cliente[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Cliente[];
      setClientes(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const createCliente = useCallback(
    async (nombre: string, fuente: string): Promise<string | null> => {
      const finalAgenciaId = agenciaIdOverride || user?.agenciaId;
      if (!user || !finalAgenciaId) return null;
      try {
        const path = `agencias/${finalAgenciaId}/clientes`;
        const ref = collection(db, path);
        const doc = await addDoc(ref, {
          nombre,
          fuente,
          creadoEn: new Date().toISOString(),
        });
        return doc.id;
      } catch (err) {
        console.error('Error creando cliente:', err);
        return null;
      }
    },
    [user]
  );

  return { clientes, loading, createCliente };
}
