'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  onSnapshot,
  doc,
  setDoc,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AppUser } from '@/types';
import { useAuth } from './useAuth';

export function useUsuarios() {
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.rol !== 'super_admin') {
      setLoading(false);
      return;
    }

    const ref = collection(db, 'usuarios');
    const q = query(ref, orderBy('email'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: AppUser[] = snapshot.docs.map((d) => ({
        uid: d.id,
        ...d.data(),
      })) as AppUser[];
      setUsuarios(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const createUsuarioDoc = useCallback(
    async (
      uid: string,
      email: string,
      nombre: string,
      rol: string,
      agenciaId: string,
      clienteId: string
    ): Promise<boolean> => {
      try {
        const ref = doc(db, 'usuarios', uid);
        await setDoc(ref, {
          email,
          nombre,
          rol,
          agenciaId,
          clienteId,
          creadoEn: new Date().toISOString(),
        });
        return true;
      } catch (err) {
        console.error('Error creando usuario:', err);
        return false;
      }
    },
    []
  );

  const updateUsuarioDoc = useCallback(
    async (
      uid: string,
      email: string,
      nombre: string,
      rol: string,
      agenciaId: string,
      clienteId: string
    ): Promise<boolean> => {
      try {
        const ref = doc(db, 'usuarios', uid);
        await setDoc(ref, {
          email,
          nombre,
          rol,
          agenciaId,
          clienteId,
        }, { merge: true });
        return true;
      } catch (err) {
        console.error('Error actualizando usuario:', err);
        return false;
      }
    },
    []
  );

  const deleteUsuario = useCallback(
    async (uid: string): Promise<boolean> => {
      try {
        // 1. Eliminar de Firebase Auth vía API
        const response = await fetch('/api/admin/users/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uid }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Error eliminando de Auth');
        }

        // 2. Eliminar de Firestore
        const { deleteDoc } = await import('firebase/firestore');
        await deleteDoc(doc(db, 'usuarios', uid));
        
        return true;
      } catch (err) {
        console.error('Error eliminando usuario:', err);
        return false;
      }
    },
    []
  );

  return { usuarios, loading, createUsuarioDoc, updateUsuarioDoc, deleteUsuario };
}
