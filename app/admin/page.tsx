'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Building2, Users, Plus, X, Key, Copy, CheckCircle2,
  ToggleLeft, ToggleRight, UserPlus, Loader2,
} from 'lucide-react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Header } from '@/components/layout/Header';
import { GlassCard } from '@/components/ui/GlassCard';
import { ToastProvider, useToast } from '@/components/ui/Toast';
import { useAuth } from '@/hooks/useAuth';
import { useAgencias } from '@/hooks/useAgencias';
import { useUsuarios } from '@/hooks/useUsuarios';
import { cn } from '@/lib/utils';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

function AdminContent() {
  const { user } = useAuth();
  const { agencias, loading: loadingAg, createAgencia, toggleLicencia } = useAgencias();
  const { usuarios, loading: loadingUs, createUsuarioDoc } = useUsuarios();
  const { toast } = useToast();

  const [tab, setTab] = useState<'agencias' | 'usuarios'>('agencias');
  const [showCreateAg, setShowCreateAg] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form agencia
  const [agNombre, setAgNombre] = useState('');
  const [agEmail, setAgEmail] = useState('');
  const [agPlan, setAgPlan] = useState('premium');
  const [creatingAg, setCreatingAg] = useState(false);

  // Form usuario
  const [usEmail, setUsEmail] = useState('');
  const [usPassword, setUsPassword] = useState('');
  const [usNombre, setUsNombre] = useState('');
  const [usRol, setUsRol] = useState('agencia');
  const [usAgenciaId, setUsAgenciaId] = useState('');
  const [usClienteId, setUsClienteId] = useState('');
  const [creatingUs, setCreatingUs] = useState(false);

  const inputClass = cn(
    'w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-4 py-2.5',
    'text-sm text-white placeholder:text-white/25 font-body',
    'focus:outline-none focus:border-neon-500/40 focus:ring-1 focus:ring-neon-500/20 transition-all'
  );

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateAgencia = async () => {
    if (!agNombre.trim() || !agEmail.trim()) return;
    setCreatingAg(true);
    const id = await createAgencia(agNombre, agEmail, agPlan);
    setCreatingAg(false);
    if (id) {
      toast(`Agencia "${agNombre}" creada`, 'success');
      setAgNombre(''); setAgEmail(''); setAgPlan('premium');
      setShowCreateAg(false);
    } else {
      toast('Error al crear agencia', 'error');
    }
  };

  const handleCreateUsuario = async () => {
    if (!usEmail.trim() || !usPassword.trim() || !usNombre.trim()) return;
    setCreatingUs(true);
    try {
      // Crear usuario en Firebase Auth
      const cred = await createUserWithEmailAndPassword(auth, usEmail, usPassword);
      // Crear documento en Firestore
      const ok = await createUsuarioDoc(
        cred.user.uid, usEmail, usNombre, usRol, usAgenciaId, usClienteId
      );
      if (ok) {
        toast(`Usuario "${usNombre}" creado`, 'success');
        setUsEmail(''); setUsPassword(''); setUsNombre('');
        setUsRol('agencia'); setUsAgenciaId(''); setUsClienteId('');
        setShowCreateUser(false);
      }
    } catch (err: any) {
      if (err?.code === 'auth/email-already-in-use') {
        toast('Ese email ya está en uso', 'error');
      } else {
        toast('Error al crear usuario', 'error');
      }
    }
    setCreatingUs(false);
  };

  const handleToggleLicencia = async (agenciaId: string, status: string) => {
    const ok = await toggleLicencia(agenciaId, status);
    if (ok) {
      toast(`Licencia ${status === 'activo' ? 'desactivada' : 'activada'}`, 'success');
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header view="kanban" onViewChange={() => {}} title="Super Admin" />

      <main className="flex-1">
        <div className="mx-auto max-w-[1200px] p-4 lg:p-6 space-y-6">
          {/* Stats rápidos */}
          <div className="grid grid-cols-3 gap-4">
            <GlassCard>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15">
                  <Building2 className="h-5 w-5 text-violet-400" />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold text-white">{agencias.length}</p>
                  <p className="text-[11px] text-white/40 font-body">Agencias</p>
                </div>
              </div>
            </GlassCard>
            <GlassCard>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neon-500/15">
                  <Users className="h-5 w-5 text-neon-400" />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold text-white">{usuarios.length}</p>
                  <p className="text-[11px] text-white/40 font-body">Usuarios</p>
                </div>
              </div>
            </GlassCard>
            <GlassCard>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15">
                  <Shield className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold text-white">
                    {agencias.filter((a) => a.estadoLicencia === 'activo').length}
                  </p>
                  <p className="text-[11px] text-white/40 font-body">Licencias activas</p>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2">
            {[
              { id: 'agencias' as const, icon: Building2, label: 'Agencias' },
              { id: 'usuarios' as const, icon: Users, label: 'Usuarios' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  'flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-medium transition-all border',
                  tab === t.id
                    ? 'border-neon-500/30 bg-neon-500/10 text-neon-400'
                    : 'border-white/[0.06] bg-white/[0.03] text-white/40 hover:text-white/60'
                )}
              >
                <t.icon className="h-3.5 w-3.5" />{t.label}
              </button>
            ))}
          </div>

          {/* Tab: Agencias */}
          {tab === 'agencias' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={() => setShowCreateAg(!showCreateAg)}
                  className="flex items-center gap-2 rounded-xl bg-neon-500/15 border border-neon-500/20 px-4 py-2.5 text-xs font-semibold text-neon-400 hover:bg-neon-500/25 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />Nueva Agencia
                </button>
              </div>

              <AnimatePresence>
                {showCreateAg && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <GlassCard className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-display font-semibold text-white">Nueva Agencia</h3>
                        <button onClick={() => setShowCreateAg(false)} className="text-white/30 hover:text-white/60"><X className="h-4 w-4" /></button>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="mb-1 block text-[11px] font-medium text-white/40">Nombre *</label>
                          <input className={inputClass} placeholder="Marketing Pro" value={agNombre} onChange={(e) => setAgNombre(e.target.value)} />
                        </div>
                        <div>
                          <label className="mb-1 block text-[11px] font-medium text-white/40">Email *</label>
                          <input className={inputClass} placeholder="admin@agencia.com" value={agEmail} onChange={(e) => setAgEmail(e.target.value)} />
                        </div>
                        <div>
                          <label className="mb-1 block text-[11px] font-medium text-white/40">Plan</label>
                          <select className={inputClass} value={agPlan} onChange={(e) => setAgPlan(e.target.value)}>
                            <option value="basic">Basic</option>
                            <option value="premium">Premium</option>
                            <option value="enterprise">Enterprise</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setShowCreateAg(false)} className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-xs text-white/50 hover:bg-white/[0.06]">Cancelar</button>
                        <button onClick={handleCreateAgencia} disabled={creatingAg || !agNombre.trim()} className="rounded-xl bg-neon-500 px-4 py-2 text-xs font-semibold text-white hover:bg-neon-400 disabled:opacity-40">
                          {creatingAg ? 'Creando...' : 'Crear Agencia'}
                        </button>
                      </div>
                    </GlassCard>
                  </motion.div>
                )}
              </AnimatePresence>

              {loadingAg ? (
                <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 text-neon-500 animate-spin" /></div>
              ) : (
                <div className="space-y-3">
                  {agencias.map((ag, i) => (
                    <motion.div key={ag.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                      <GlassCard className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
                            <Building2 className="h-5 w-5 text-violet-400" />
                          </div>
                          <div>
                            <h4 className="text-[14px] font-display font-semibold text-white">{ag.nombre}</h4>
                            <p className="text-[11px] text-white/35 font-body">{ag.email} · {ag.plan}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {/* API Key */}
                          <div className="flex items-center gap-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] px-2.5 py-1.5">
                            <Key className="h-3 w-3 text-amber-400" />
                            <span className="text-[10px] font-mono text-white/40 max-w-[120px] truncate">{ag.apiKey}</span>
                            <button onClick={() => copyToClipboard(ag.apiKey, `key-${ag.id}`)} className="text-white/30 hover:text-white/60">
                              {copiedId === `key-${ag.id}` ? <CheckCircle2 className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                            </button>
                          </div>
                          {/* ID */}
                          <div className="flex items-center gap-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] px-2.5 py-1.5">
                            <span className="text-[10px] font-mono text-white/40 max-w-[100px] truncate">{ag.id}</span>
                            <button onClick={() => copyToClipboard(ag.id, `id-${ag.id}`)} className="text-white/30 hover:text-white/60">
                              {copiedId === `id-${ag.id}` ? <CheckCircle2 className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                            </button>
                          </div>
                          {/* Licencia toggle */}
                          <button
                            onClick={() => handleToggleLicencia(ag.id, ag.estadoLicencia)}
                            className={cn(
                              'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-all border',
                              ag.estadoLicencia === 'activo'
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                : 'bg-red-500/10 border-red-500/20 text-red-400'
                            )}
                          >
                            {ag.estadoLicencia === 'activo' ? (
                              <><ToggleRight className="h-4 w-4" />Activo</>
                            ) : (
                              <><ToggleLeft className="h-4 w-4" />Inactivo</>
                            )}
                          </button>
                        </div>
                      </GlassCard>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab: Usuarios */}
          {tab === 'usuarios' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={() => setShowCreateUser(!showCreateUser)}
                  className="flex items-center gap-2 rounded-xl bg-neon-500/15 border border-neon-500/20 px-4 py-2.5 text-xs font-semibold text-neon-400 hover:bg-neon-500/25 transition-colors"
                >
                  <UserPlus className="h-3.5 w-3.5" />Nuevo Usuario
                </button>
              </div>

              <AnimatePresence>
                {showCreateUser && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <GlassCard className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-display font-semibold text-white">Nuevo Usuario</h3>
                        <button onClick={() => setShowCreateUser(false)} className="text-white/30 hover:text-white/60"><X className="h-4 w-4" /></button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="mb-1 block text-[11px] font-medium text-white/40">Nombre *</label>
                          <input className={inputClass} placeholder="Juan Pérez" value={usNombre} onChange={(e) => setUsNombre(e.target.value)} />
                        </div>
                        <div>
                          <label className="mb-1 block text-[11px] font-medium text-white/40">Email *</label>
                          <input className={inputClass} placeholder="juan@agencia.com" type="email" value={usEmail} onChange={(e) => setUsEmail(e.target.value)} />
                        </div>
                        <div>
                          <label className="mb-1 block text-[11px] font-medium text-white/40">Contraseña *</label>
                          <input className={inputClass} placeholder="Min. 6 caracteres" type="password" value={usPassword} onChange={(e) => setUsPassword(e.target.value)} />
                        </div>
                        <div>
                          <label className="mb-1 block text-[11px] font-medium text-white/40">Rol *</label>
                          <select className={inputClass} value={usRol} onChange={(e) => setUsRol(e.target.value)}>
                            <option value="agencia">Agencia</option>
                            <option value="cliente">Cliente</option>
                          </select>
                        </div>
                        <div>
                          <label className="mb-1 block text-[11px] font-medium text-white/40">ID Agencia *</label>
                          <input className={inputClass} placeholder="Pega el ID de la agencia" value={usAgenciaId} onChange={(e) => setUsAgenciaId(e.target.value)} />
                        </div>
                        <div>
                          <label className="mb-1 block text-[11px] font-medium text-white/40">ID Cliente (solo rol cliente)</label>
                          <input className={inputClass} placeholder="Pega el ID del cliente" value={usClienteId} onChange={(e) => setUsClienteId(e.target.value)} />
                        </div>
                      </div>
                      <p className="text-[10px] text-white/25 font-body">
                        El ID de agencia y cliente se copian desde la lista de agencias o desde el panel de la agencia.
                      </p>
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setShowCreateUser(false)} className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-xs text-white/50 hover:bg-white/[0.06]">Cancelar</button>
                        <button onClick={handleCreateUsuario} disabled={creatingUs || !usEmail.trim() || !usNombre.trim() || !usPassword.trim()} className="rounded-xl bg-neon-500 px-4 py-2 text-xs font-semibold text-white hover:bg-neon-400 disabled:opacity-40">
                          {creatingUs ? 'Creando...' : 'Crear Usuario'}
                        </button>
                      </div>
                    </GlassCard>
                  </motion.div>
                )}
              </AnimatePresence>

              {loadingUs ? (
                <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 text-neon-500 animate-spin" /></div>
              ) : (
                <div className="space-y-2">
                  {usuarios.map((u, i) => (
                    <motion.div key={u.uid} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                      <GlassCard className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            'flex h-8 w-8 items-center justify-center rounded-lg',
                            u.rol === 'super_admin' ? 'bg-amber-500/15' :
                            u.rol === 'agencia' ? 'bg-violet-500/15' : 'bg-neon-500/15'
                          )}>
                            <Users className={cn(
                              'h-4 w-4',
                              u.rol === 'super_admin' ? 'text-amber-400' :
                              u.rol === 'agencia' ? 'text-violet-400' : 'text-neon-400'
                            )} />
                          </div>
                          <div>
                            <p className="text-[13px] font-display font-semibold text-white">{u.nombre || u.email}</p>
                            <p className="text-[11px] text-white/30 font-body">{u.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={cn(
                            'rounded-lg px-2.5 py-1 text-[10px] font-mono font-semibold border',
                            u.rol === 'super_admin' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                            u.rol === 'agencia' ? 'bg-violet-500/10 border-violet-500/20 text-violet-400' :
                            'bg-neon-500/10 border-neon-500/20 text-neon-400'
                          )}>
                            {u.rol}
                          </span>
                          {u.agenciaId && (
                            <span className="text-[10px] font-mono text-white/25 max-w-[100px] truncate">
                              Ag: {u.agenciaId.slice(0, 8)}...
                            </span>
                          )}
                        </div>
                      </GlassCard>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function AdminPage() {
  return (
    <AuthGuard allowedRoles={['super_admin']}>
      <ToastProvider>
        <AdminContent />
      </ToastProvider>
    </AuthGuard>
  );
}
