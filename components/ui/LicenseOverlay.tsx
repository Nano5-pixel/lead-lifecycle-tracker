'use client';

import { motion } from 'framer-motion';
import { ShieldOff, Mail } from 'lucide-react';

interface LicenseOverlayProps {
  clientName: string;
}

export function LicenseOverlay({ clientName }: LicenseOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-navy-950/95 backdrop-blur-xl"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
      <motion.div
        initial={{ scale: 0.9, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 200, delay: 0.2 }}
        className="relative w-full max-w-lg rounded-3xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl p-10 text-center shadow-[0_16px_64px_rgba(0,0,0,0.5)]"
      >
        <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 15, delay: 0.4 }}
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-red-500/10 border border-red-500/15"
        >
          <ShieldOff className="h-10 w-10 text-red-400" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <h1 className="mb-2 text-2xl font-display font-bold text-white">Servicio Suspendido</h1>
          <p className="mb-1 text-sm text-white/40 font-body">{clientName}</p>
          <p className="mb-8 text-sm text-white/50 leading-relaxed font-body">
            La licencia de este panel ha expirado o ha sido desactivada.
            <br />
            Contacta a tu proveedor para reactivar el servicio.
          </p>
          <a
            href="mailto:soporte@tuproveedor.com"
            className="inline-flex items-center gap-2 rounded-xl bg-neon-500/20 border border-neon-500/30 px-6 py-3 text-sm font-medium text-neon-400 hover:bg-neon-500/30 transition-colors"
          >
            <Mail className="h-4 w-4" />
            Contactar Soporte
          </a>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
