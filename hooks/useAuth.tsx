'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  User,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { AppUser, UserRole } from '@/types';

// ==============================================
// CONTEXTO DE AUTENTICACIÓN
// ==============================================

interface AuthContextValue {
  user: AppUser | null;
  firebaseUser: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  firebaseUser: null,
  loading: true,
  error: null,
  signIn: async () => false,
  signOut: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Escuchar cambios de auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setFirebaseUser(fbUser);
        // Buscar datos del usuario en Firestore
        try {
          console.log('Buscando usuario con UID:', fbUser.uid);
          const userDoc = await getDoc(doc(db, 'usuarios', fbUser.uid));
          console.log('Documento existe:', userDoc.exists());
          console.log('Datos del documento:', JSON.stringify(userDoc.data()));
          console.log('UID buscado:', fbUser.uid);
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUser({
              uid: fbUser.uid,
              email: data.email || fbUser.email || '',
              nombre: data.nombre || '',
              rol: data.rol as UserRole,
              agenciaId: data.agenciaId || '',
              clienteId: data.clienteId || '',
            });
          } else {
            // Usuario existe en Auth pero no en Firestore
            setUser(null);
            setError('Usuario no autorizado. Contacta al administrador.');
            await firebaseSignOut(auth);
          }
        } catch (err) {
          console.error('Error cargando usuario:', err);
          console.error('Detalle del error:', JSON.stringify(err));
          setUser(null);
          setError('Error cargando datos del usuario.');
        }
      } else {
        setFirebaseUser(null);
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string): Promise<boolean> => {
    setError(null);
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setError('Email o contraseña incorrectos.');
      } else if (code === 'auth/too-many-requests') {
        setError('Demasiados intentos. Espera unos minutos.');
      } else {
        setError('Error al iniciar sesión. Intenta de nuevo.');
      }
      setLoading(false);
      return false;
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setFirebaseUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, error, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
