'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { signIn, error, loading } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setSubmitting(true);
    const ok = await signIn(email, password);
    if (ok) {
      router.push('/');
    }
    setSubmitting(false);
  };

  const inputClass = cn(
    'w-full rounded-xl bg-bg-primary/30 border border-border-subtle pl-11 pr-4 py-3',
    'text-sm text-text-primary placeholder:text-text-muted/50 font-body',
    'focus:outline-none focus:border-neon-500/40 focus:ring-1 focus:ring-neon-500/20',
    'transition-all duration-200',
    'autofill:bg-transparent autofill:text-text-primary'
  );

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      {/* Fondo decorativo */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #0A84FF, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full opacity-[0.03]"
          style={{ background: 'radial-gradient(circle, #10B981, transparent 70%)' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        {/* Card */}
        <div className="rounded-2xl border border-border-subtle bg-bg-primary/95 backdrop-blur-xl p-8 shadow-glass">
          {/* Línea decorativa superior */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-neon-500/30 to-transparent rounded-t-2xl" />

          {/* Logo / Header */}
          <div className="mb-8 text-center">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-neon-500/15 border border-neon-500/20"
            >
              <div className="h-5 w-5 rounded-lg bg-neon-500" />
            </motion.div>
            <h1 className="text-xl font-display font-bold text-text-primary">
              Lead Lifecycle Tracker
            </h1>
            <p className="mt-1 text-sm text-text-muted font-body">
              Ingresa con tus credenciales
            </p>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/15 px-4 py-3"
            >
              <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-400/80 font-body">{error}</p>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted/40" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                required
                autoComplete="email"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted/40" />
              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || loading}
              className={cn(
                'w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-all',
                'bg-neon-500 hover:bg-neon-400 active:scale-[0.98]',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'shadow-[0_4px_20px_rgba(10,132,255,0.3)]'
              )}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogIn className="h-4 w-4" />
              )}
              {submitting ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-[11px] text-text-muted/30 font-body">
          Lead Lifecycle Tracker v2.0
        </p>
      </motion.div>
    </div>
  );
}
