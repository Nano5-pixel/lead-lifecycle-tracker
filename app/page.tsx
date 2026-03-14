'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      window.location.href = '/login';
      return;
    }

    switch (user.rol) {
      case 'super_admin':
        window.location.href = '/admin';
        break;
      case 'agencia':
        window.location.href = '/agencia';
        break;
      case 'cliente':
        window.location.href = '/dashboard';
        break;
      default:
        window.location.href = '/login';
    }
  }, [user, loading]);

  return (
    <div className="flex h-screen items-center justify-center bg-navy-950">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4"
      >
        <Loader2 className="h-8 w-8 text-neon-500 animate-spin" />
        <p className="text-sm font-body text-white/30">Redirigiendo...</p>
      </motion.div>
    </div>
  );
}
