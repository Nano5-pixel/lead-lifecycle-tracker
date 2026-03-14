'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // No autenticado → login
    if (!user) {
      router.replace('/login');
      return;
    }

    // Rol no permitido → redirigir a su página correcta
    if (allowedRoles && !allowedRoles.includes(user.rol)) {
      if (user.rol === 'super_admin') router.replace('/admin');
      else if (user.rol === 'agencia') router.replace('/agencia');
      else if (user.rol === 'cliente') router.replace('/');
      else router.replace('/login');
    }
  }, [user, loading, allowedRoles, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-navy-950">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="h-8 w-8 text-neon-500 animate-spin" />
          <p className="text-sm font-body text-white/30">Cargando...</p>
        </motion.div>
      </div>
    );
  }

  if (!user) return null;
  if (allowedRoles && !allowedRoles.includes(user.rol)) return null;

  return <>{children}</>;
}
