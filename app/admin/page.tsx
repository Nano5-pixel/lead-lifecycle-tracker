'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Building2, Users, Plus, X, Key, Copy, CheckCircle2,
  ToggleLeft, ToggleRight, UserPlus, Loader2, Pencil, Trash2, AlertCircle
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
  const { agencias, loading: loadingAg, createAgencia, toggleLicencia, updateAgencia, deleteAgencia } = useAgencias();
  const { usuarios, loading: loadingUs, createUsuarioDoc, updateUsuarioDoc, deleteUsuario } = useUsuarios();
  const { toast } = useToast();

  const [tab, setTab] = useState<'agencias' | 'usuarios'>('agencias');
  const [showCreateAg, setShowCreateAg] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingAg, setEditingAg] = useState<any>(null);
  const [editingUs, setEditingUs] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
    'w-full rounded-xl bg-bg-primary/30 border border-border-subtle px-4 py-2.5',
    'text-sm text-text-primary placeholder:text-text-muted font-body',
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

  const handleUpdateAgencia = async () => {
    if (!editingAg) return;
    const ok = await updateAgencia(editingAg.id, {
      nombre: agNombre,
      email: agEmail,
      plan: agPlan
    });
    if (ok) {
      toast('Agencia actualizada', 'success');
      setEditingAg(null);
      setAgNombre(''); setAgEmail(''); setAgPlan('premium');
    } else {
      toast('Error al actualizar agencia', 'error');
    }
  };

  const handleDeleteAgencia = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta agencia? Se borrarán sus datos de Firestore.')) return;
    const ok = await deleteAgencia(id);
    if (ok) toast('Agencia eliminada', 'success');
    else toast('Error al eliminar agencia', 'error');
  };

  const handleUpdateUsuario = async () => {
    if (!editingUs) return;
    const ok = await updateUsuarioDoc(
      editingUs.uid, usEmail, usNombre, usRol, usAgenciaId, usClienteId
    );
    if (ok) {
      toast('Usuario actualizado', 'success');
      setEditingUs(null);
      setUsEmail(''); setUsNombre(''); setUsRol('agencia'); setUsAgenciaId(''); setUsClienteId('');
    } else {
      toast('Error al actualizar usuario', 'error');
    }
  };

  const handleDeleteUsuario = async (uid: string) => {
    if (!confirm('¿Estás seguro de eliminar este usuario? Se borrará de Firestore y Firebase Auth.')) return;
    const ok = await deleteUsuario(uid);
    if (ok) toast('Usuario eliminado', 'success');
    else toast('Error al eliminar usuario', 'error');
  };

  const handleCleanupDemo = async () => {
    if (!confirm('Se eliminará la "Agencia Demo" y todos sus usuarios asociados. ¿Continuar?')) return;
    
    const demoAg = agencias.find(a => a.nombre === 'Agencia Demo');
    if (demoAg) {
      // Borrar usuarios asociados
      const demoUsers = usuarios.filter(u => u.agenciaId === demoAg.id);
      for (const u of demoUsers) {
        await deleteUsuario(u.uid);
      }
      // Borrar agencia
      await deleteAgencia(demoAg.id);
      toast('Datos demo eliminados correctamente', 'success');
    } else {
      toast('No se encontró la Agencia Demo', 'info');
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header view="kanban" title="Super Admin" />

      <main className="flex-1">
        <div className="mx-auto max-w-[1200px] p-4 lg:p-6 space-y-6">
          {/* Stats rápidos */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <GlassCard>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15">
                  <Building2 className="h-5 w-5 text-violet-400" />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold text-text-primary">{agencias.length}</p>
                  <p className="text-[11px] text-text-muted font-body">Agencias</p>
                </div>
              </div>
            </GlassCard>
            <GlassCard>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neon-500/15">
                  <Users className="h-5 w-5 text-neon-400" />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold text-text-primary">{usuarios.length}</p>
                  <p className="text-[11px] text-text-muted font-body">Usuarios</p>
                </div>
              </div>
            </GlassCard>
            <GlassCard>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15">
                  <Shield className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold text-text-primary">
                    {agencias.filter((a) => a.estadoLicencia === 'activo').length}
                  </p>
                  <p className="text-[11px] text-text-muted font-body">Licencias activas</p>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Tabs */}
          <div className="flex items-center justify-between">
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
                      : 'border-border-subtle bg-bg-primary/30 text-text-muted hover:text-text-primary'
                  )}
                >
                  <t.icon className="h-3.5 w-3.5" />{t.label}
                </button>
              ))}
            </div>
            
            <button
              onClick={handleCleanupDemo}
              className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-2 text-[10px] font-semibold text-red-400 hover:bg-red-500/20 transition-colors"
            >
              <Trash2 className="h-3 w-3" />Eliminar Datos Demo
            </button>
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
                {(showCreateAg || editingAg) && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <GlassCard className="space-y-3 border-amber-500/20">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-display font-semibold text-text-primary">
                          {editingAg ? `Editando: ${editingAg.nombre}` : 'Nueva Agencia'}
                        </h3>
                        <button onClick={() => { setShowCreateAg(false); setEditingAg(null); }} className="text-text-muted hover:text-text-secondary"><X className="h-4 w-4" /></button>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="mb-1 block text-[11px] font-medium text-text-muted">Nombre *</label>
                          <input className={inputClass} placeholder="Marketing Pro" value={agNombre} onChange={(e) => setAgNombre(e.target.value)} />
                        </div>
                        <div>
                          <label className="mb-1 block text-[11px] font-medium text-text-muted">Email *</label>
                          <input className={inputClass} placeholder="admin@agencia.com" value={agEmail} onChange={(e) => setAgEmail(e.target.value)} />
                        </div>
                        <div>
                          <label className="mb-1 block text-[11px] font-medium text-text-muted">Plan</label>
                          <select className={cn(inputClass, 'bg-bg-primary')} value={agPlan} onChange={(e) => setAgPlan(e.target.value)}>
                            <option value="basic">Basic</option>
                            <option value="premium">Premium</option>
                            <option value="enterprise">Enterprise</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button onClick={() => { setShowCreateAg(false); setEditingAg(null); }} className="rounded-xl border border-border-subtle bg-bg-primary/20 px-4 py-2 text-xs text-text-muted hover:bg-bg-primary/40">Cancelar</button>
                        <button 
                          onClick={editingAg ? handleUpdateAgencia : handleCreateAgencia} 
                          disabled={creatingAg || !agNombre.trim()} 
                          className="rounded-xl bg-neon-500 px-4 py-2 text-xs font-semibold text-white hover:bg-neon-400 disabled:opacity-40"
                        >
                          {creatingAg ? 'Guardando...' : editingAg ? 'Guardar Cambios' : 'Crear Agencia'}
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
                      <GlassCard className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
                            <Building2 className="h-5 w-5 text-violet-400" />
                          </div>
                          <div>
                            <h4 className="text-[14px] font-display font-semibold text-text-primary">{ag.nombre}</h4>
                            <p className="text-[11px] text-text-muted font-body">{ag.email} · {ag.plan}</p>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                          {/* API Key */}
                          <div className="flex items-center gap-1.5 rounded-lg bg-bg-primary/40 border border-border-subtle px-2.5 py-1.5">
                            <Key className="h-3 w-3 text-amber-400" />
                            <span className="text-[10px] font-mono text-text-muted max-w-[120px] truncate">{ag.apiKey}</span>
                            <button onClick={() => copyToClipboard(ag.apiKey, `key-${ag.id}`)} className="text-text-muted hover:text-text-secondary">
                              {copiedId === `key-${ag.id}` ? <CheckCircle2 className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                            </button>
                          </div>
                          {/* ID */}
                          <div className="flex items-center gap-1.5 rounded-lg bg-bg-primary/40 border border-border-subtle px-2.5 py-1.5">
                            <span className="text-[10px] font-mono text-text-muted max-w-[100px] truncate">{ag.id}</span>
                            <button onClick={() => copyToClipboard(ag.id, `id-${ag.id}`)} className="text-text-muted hover:text-text-secondary">
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

                          {/* Acciones CRUD */}
                          <div className="flex items-center gap-2 border-t sm:border-t-0 sm:border-l border-border-subtle pt-3 sm:pt-0 sm:pl-3 justify-end">
                            <button
                              onClick={() => {
                                setEditingAg(ag);
                                setAgNombre(ag.nombre);
                                setAgEmail(ag.email);
                                setAgPlan(ag.plan);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-primary/50 rounded-xl transition-all"
                              title="Editar"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteAgencia(ag.id)}
                              className="p-2 text-red-500/30 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                              title="Eliminar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
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
                {(showCreateUser || editingUs) && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <GlassCard className="space-y-3 border-amber-500/20">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-display font-semibold text-text-primary">
                          {editingUs ? `Editando: ${editingUs.nombre}` : 'Nuevo Usuario'}
                        </h3>
                        <button onClick={() => { setShowCreateUser(false); setEditingUs(null); }} className="text-text-muted hover:text-text-secondary"><X className="h-4 w-4" /></button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2 sm:col-span-1">
                          <label className="mb-1 block text-[11px] font-medium text-text-muted/60">Nombre *</label>
                          <input className={inputClass} placeholder="Juan Pérez" value={usNombre} onChange={(e) => setUsNombre(e.target.value)} />
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <label className="mb-1 block text-[11px] font-medium text-text-muted/60">Email *</label>
                          <input className={inputClass} placeholder="juan@agencia.com" type="email" value={usEmail} onChange={(e) => setUsEmail(e.target.value)} disabled={!!editingUs} />
                        </div>
                        
                        {!editingUs && (
                          <div className="col-span-2">
                             <label className="mb-1 block text-[11px] font-medium text-text-muted/60">Contraseña *</label>
                             <input className={inputClass} placeholder="Min. 6 caracteres" type="password" value={usPassword} onChange={(e) => setUsPassword(e.target.value)} />
                          </div>
                        )}

                        <div>
                          <label className="mb-1 block text-[11px] font-medium text-text-muted/60">Rol *</label>
                          <select className={cn(inputClass, 'bg-bg-primary')} value={usRol} onChange={(e) => setUsRol(e.target.value)}>
                            <option value="agencia">Agencia</option>
                            <option value="cliente">Cliente</option>
                            <option value="super_admin">Super Admin</option>
                          </select>
                        </div>
                        <div>
                          <label className="mb-1 block text-[11px] font-medium text-text-muted/60">ID Agencia</label>
                          <input className={inputClass} placeholder="ID de la agencia" value={usAgenciaId} onChange={(e) => setUsAgenciaId(e.target.value)} />
                        </div>
                        <div className="col-span-2">
                          <label className="mb-1 block text-[11px] font-medium text-text-muted/60">ID Cliente (solo rol cliente)</label>
                          <input className={inputClass} placeholder="ID del cliente" value={usClienteId} onChange={(e) => setUsClienteId(e.target.value)} />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button onClick={() => { setShowCreateUser(false); setEditingUs(null); }} className="rounded-xl border border-border-subtle bg-bg-primary/20 px-4 py-2 text-xs text-text-muted hover:bg-bg-primary/40">Cancelar</button>
                        <button 
                          onClick={editingUs ? handleUpdateUsuario : handleCreateUsuario} 
                          disabled={creatingUs || !usEmail.trim() || !usNombre.trim() || (!editingUs && !usPassword.trim())} 
                          className="rounded-xl bg-neon-500 px-4 py-2 text-xs font-semibold text-white hover:bg-neon-400 disabled:opacity-40"
                        >
                          {creatingUs ? 'Guardando...' : editingUs ? 'Guardar Cambios' : 'Crear Usuario'}
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
                      <GlassCard className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                            <p className="text-[13px] font-display font-semibold text-text-primary">{u.nombre || u.email}</p>
                            <p className="text-[11px] text-text-muted font-body">{u.email}</p>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                          <span className={cn(
                            'rounded-lg px-2.5 py-1 text-[10px] font-mono font-semibold border',
                            u.rol === 'super_admin' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                            u.rol === 'agencia' ? 'bg-violet-500/10 border-violet-500/20 text-violet-400' :
                            'bg-neon-500/10 border-neon-500/20 text-neon-400'
                          )}>
                            {u.rol}
                          </span>
                          {u.agenciaId && (
                            <span className="text-[10px] font-mono text-text-muted/50 max-w-[100px] truncate">
                              Ag: {u.agenciaId.slice(0, 8)}...
                            </span>
                          )}

                          {/* Acciones CRUD */}
                          <div className="flex items-center gap-2 border-t sm:border-t-0 sm:border-l border-border-subtle pt-3 sm:pt-0 sm:pl-3 ml-0 sm:ml-1 justify-end">
                            <button
                              onClick={() => {
                                setEditingUs(u);
                                setUsNombre(u.nombre || '');
                                setUsEmail(u.email);
                                setUsRol(u.rol);
                                setUsAgenciaId(u.agenciaId || '');
                                setUsClienteId(u.clienteId || '');
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className="p-1.5 text-text-muted hover:text-text-primary hover:bg-bg-primary/50 rounded-lg transition-all"
                              title="Editar"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteUsuario(u.uid)}
                              className="p-1.5 text-red-500/30 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                              title="Eliminar"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
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
