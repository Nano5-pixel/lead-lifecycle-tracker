'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Building2, Users, Plus, X, Key, Copy, CheckCircle2,
  ToggleLeft, ToggleRight, UserPlus, Loader2, Pencil, Trash2, AlertCircle, ChevronRight, User
} from 'lucide-react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Header } from '@/components/layout/Header';
import { GlassCard } from '@/components/ui/GlassCard';
import { ToastProvider, useToast } from '@/components/ui/Toast';
import { useAuth } from '@/hooks/useAuth';
import { useAgencias } from '@/hooks/useAgencias';
import { useUsuarios } from '@/hooks/useUsuarios';
import { useClientes } from '@/hooks/useClientes';
import { cn } from '@/lib/utils';

function AdminContent() {
  const { user } = useAuth();
  const { agencias, loading: loadingAg, createAgencia, toggleLicencia, deleteAgencia } = useAgencias();
  const { usuarios, loading: loadingUs, deleteUsuario } = useUsuarios();
  const { toast } = useToast();

  // Drill-down state
  const [selectedAgencia, setSelectedAgencia] = useState<any>(null);
  const [selectedCliente, setSelectedCliente] = useState<any>(null);
  
  // Custom hook usage for clients (dynamic based on selected agency)
  const { clientes, loading: loadingCl, createCliente } = useClientes(selectedAgencia?.id);

  const [showCreateAg, setShowCreateAg] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showCreateCl, setShowCreateCl] = useState(false);
  
  const [editingUs, setEditingUs] = useState<any>(null);

  // Form states
  const [agNombre, setAgNombre] = useState('');
  const [agEmail, setAgEmail] = useState('');
  const [agPlan, setAgPlan] = useState('premium');
  const [creatingAg, setCreatingAg] = useState(false);

  const [clNombre, setClNombre] = useState('');
  const [clFuente, setClFuente] = useState('');
  const [creatingCl, setCreatingCl] = useState(false);

  const [usEmail, setUsEmail] = useState('');
  const [usPassword, setUsPassword] = useState('');
  const [usNombre, setUsNombre] = useState('');
  const [usRol, setUsRol] = useState('agencia');
  const [creatingUs, setCreatingUs] = useState(false);

  const inputClass = cn(
    'w-full rounded-xl bg-bg-primary/30 border border-border-subtle px-4 py-2.5',
    'text-sm text-text-primary placeholder:text-text-muted font-body',
    'focus:outline-none focus:border-neon-500/40 focus:ring-1 focus:ring-neon-500/20 transition-all'
  );

  const handleCreateAgencia = async () => {
    if (!agNombre.trim() || !agEmail.trim()) return;
    setCreatingAg(true);
    const id = await createAgencia(agNombre, agEmail, agPlan);
    setCreatingAg(false);
    if (id) {
      toast(`Agencia "${agNombre}" creada`, 'success');
      setAgNombre(''); setAgEmail(''); setAgPlan('premium');
      setShowCreateAg(false);
    }
  };

  const handleCreateCliente = async () => {
    if (!clNombre.trim()) return;
    setCreatingCl(true);
    const id = await createCliente(clNombre, clFuente);
    setCreatingCl(false);
    if (id) {
      toast(`Cliente "${clNombre}" creado`, 'success');
      setClNombre(''); setClFuente('');
      setShowCreateCl(false);
    }
  };

  const handleCreateUsuario = async () => {
    if (!usEmail.trim() || !usPassword.trim() || !usNombre.trim()) return;
    setCreatingUs(true);
    try {
      const response = await fetch('/api/admin/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: usEmail,
          password: usPassword,
          nombre: usNombre,
          rol: usRol,
          agenciaId: selectedAgencia?.id || '',
          clienteId: selectedCliente?.id || ''
        }),
      });

      if (response.ok) {
        toast(`Usuario "${usNombre}" creado`, 'success');
        setUsEmail(''); setUsPassword(''); setUsNombre('');
        setShowCreateUser(false);
      } else {
        const err = await response.json();
        toast(err.error || 'Error al crear usuario', 'error');
      }
    } catch (err) {
      toast('Error de conexión', 'error');
    }
    setCreatingUs(false);
  };

  const handleToggleLicencia = async (agenciaId: string, status: string) => {
    const ok = await toggleLicencia(agenciaId, status);
    if (ok) toast(`Licencia ${status === 'activo' ? 'desactivada' : 'activada'}`, 'success');
  };

  const handleDeleteAgencia = async (id: string) => {
    if (!confirm('¿Estás seguro? Se borrarán todos los datos de la agencia.')) return;
    const ok = await deleteAgencia(id);
    if (ok) toast('Agencia eliminada', 'success');
  };

  const handleDeleteUsuario = async (uid: string) => {
    if (!confirm('¿Eliminar acceso de este usuario?')) return;
    const ok = await deleteUsuario(uid);
    if (ok) toast('Usuario eliminado', 'success');
  };

  return (
    <div className="flex min-h-screen flex-col relative overflow-hidden">
      {/* Background Gradients (Blue/Purple) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full" />
      </div>

      <Header view="kanban" title="Super Admin" />

      <main className="flex-1 relative z-10">
        <div className="mx-auto max-w-[1200px] p-4 lg:p-6 space-y-6">
          
          {/* Breadcrumbs with Premium Style */}
          <div className="flex items-center gap-2 text-[10px] sm:text-xs font-medium bg-white/5 border border-white/10 w-fit px-4 py-2 rounded-full backdrop-blur-md shadow-lg">
            <button 
              onClick={() => { setSelectedAgencia(null); setSelectedCliente(null); }}
              className={cn("hover:text-neon-400 transition-colors uppercase tracking-widest", !selectedAgencia ? "text-neon-400" : "text-text-muted")}
            >
              Agencias
            </button>
            {selectedAgencia && (
              <>
                <ChevronRight className="h-3 w-3 text-text-muted" />
                <button 
                  onClick={() => setSelectedCliente(null)}
                  className={cn("hover:text-neon-400 transition-colors capitalize", !selectedCliente ? "text-neon-400" : "text-text-muted")}
                >
                  {selectedAgencia.nombre}
                </button>
              </>
            )}
            {selectedCliente && (
              <>
                <ChevronRight className="h-3 w-3 text-text-muted" />
                <span className="text-neon-400 capitalize">{selectedCliente.nombre}</span>
              </>
            )}
          </div>

          {/* DRILL-DOWN VIEWS */}
          {selectedAgencia ? (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {!selectedCliente ? (
                /* VISTA 2: CLIENTES DE LA AGENCIA SELECCIONADA + PERSONAL DE AGENCIA */
                <div className="space-y-4">
                  {/* Sección: Personal Administrativo de la Agencia */}
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black text-text-muted uppercase tracking-widest pl-1">Personal Administrativo</h3>
                      <button
                        onClick={() => { setSelectedCliente({ id: '', nombre: 'Administración' }); setShowCreateUser(true); }}
                        className="flex items-center gap-2 text-[10px] font-bold text-violet-400 hover:text-violet-300 transition-colors"
                      >
                        <UserPlus className="h-3 w-3" />Añadir Admin
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {usuarios.filter(u => u.agenciaId === selectedAgencia.id && !u.clienteId).map((u) => (
                        <div key={u.uid} className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5 group hover:bg-white/[0.04] transition-all">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 flex items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                              <Shield className="h-4 w-4" />
                            </div>
                            <div>
                               <p className="text-xs font-bold text-text-primary">{u.nombre}</p>
                               <p className="text-[10px] text-text-muted">{u.email}</p>
                            </div>
                          </div>
                          <button onClick={() => handleDeleteUsuario(u.uid)} className="p-2 text-text-muted/20 hover:text-red-400 transition-colors">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                      {usuarios.filter(u => u.agenciaId === selectedAgencia.id && !u.clienteId).length === 0 && (
                        <p className="text-[10px] text-text-muted italic pl-1 opacity-50">No hay administradores directos asignados.</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div>
                      <h2 className="text-xl font-display font-bold text-text-primary">
                        Clientes Registrados
                      </h2>
                      <p className="text-xs text-text-muted">Pipelines y flujos de leads activos</p>
                    </div>
                    <button
                      onClick={() => setShowCreateCl(true)}
                      className="flex items-center gap-2 rounded-xl bg-neon-500/15 border border-neon-500/20 px-5 py-3 text-xs font-bold text-neon-400 hover:bg-neon-500/25 transition-all shadow-lg active:scale-95"
                    >
                      <Plus className="h-4 w-4" />Nuevo Cliente
                    </button>
                  </div>

                  <AnimatePresence>
                    {showCreateCl && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <GlassCard className="space-y-4 border-neon-500/20 shadow-xl shadow-neon-500/5">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="mb-1 block text-[11px] font-medium text-text-muted uppercase tracking-wider">Nombre del Cliente</label>
                              <input className={inputClass} placeholder="Ej: Napz Prueba" value={clNombre} onChange={(e) => setClNombre(e.target.value)} />
                            </div>
                            <div>
                              <label className="mb-1 block text-[11px] font-medium text-text-muted uppercase tracking-wider">Fuente Principal</label>
                              <input className={inputClass} placeholder="Facebook, Google, etc." value={clFuente} onChange={(e) => setClFuente(e.target.value)} />
                            </div>
                          </div>
                          <div className="flex justify-end gap-3 pt-2">
                            <button onClick={() => setShowCreateCl(false)} className="px-4 py-2 text-xs text-text-muted hover:text-text-primary transition-colors">Cancelar</button>
                            <button onClick={handleCreateCliente} disabled={creatingCl} className="rounded-xl bg-neon-500 px-8 py-2.5 text-xs font-black text-white uppercase tracking-widest shadow-xl shadow-neon-500/20 hover:scale-105 active:scale-95 transition-all">
                              {creatingCl ? 'Creando...' : 'Crear Registro'}
                            </button>
                          </div>
                        </GlassCard>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {loadingCl ? (
                    <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 text-neon-500 animate-spin opacity-50" /></div>
                  ) : clientes.length === 0 ? (
                    <div className="text-center py-24 border border-dashed border-white/10 rounded-[2rem] bg-white/[0.02]">
                      <Users className="h-12 w-12 text-text-muted mx-auto mb-4 opacity-10" />
                      <p className="text-text-muted font-display font-medium">Esta agencia aún no tiene clientes activos</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {clientes.map((cl: any) => (
                        <GlassCard 
                          key={cl.id} 
                          className="cursor-pointer hover:border-violet-500/40 transition-all group relative overflow-hidden hover:shadow-2xl hover:shadow-violet-500/10 active:scale-[0.98]"
                          onClick={() => setSelectedCliente(cl)}
                        >
                          <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity">
                             <ChevronRight className="h-5 w-5 text-neon-400 transform group-hover:translate-x-1 transition-transform" />
                          </div>
                          <div className="flex items-center gap-4 mb-4">
                            <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400 group-hover:bg-violet-500/20 transition-colors border border-violet-500/10">
                              <Users className="h-6 w-6" />
                            </div>
                            <div>
                               <h4 className="text-lg font-display font-bold text-text-primary group-hover:text-white transition-colors">{cl.nombre}</h4>
                               <p className="text-[11px] text-text-muted font-body uppercase tracking-tighter">{cl.fuente || 'Sin fuente'}</p>
                            </div>
                          </div>
                          <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                             <span className="text-[9px] font-mono text-text-muted/40 tracking-widest">ID: {cl.id.slice(0, 12)}...</span>
                             <span className="text-[10px] font-bold text-violet-400 group-hover:text-neon-400 transition-colors">VER ACCESOS</span>
                          </div>
                        </GlassCard>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* VISTA 3: USUARIOS DEL CLIENTE SELECCIONADO */
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-display font-bold text-text-primary">
                        Accesos: <span className="text-neon-400">{selectedCliente.nombre}</span>
                      </h2>
                      <p className="text-xs text-text-muted">Crea las credenciales de acceso para este pipeline específico</p>
                    </div>
                    <button
                      onClick={() => setShowCreateUser(true)}
                      className="flex items-center gap-2 rounded-xl bg-neon-500/15 border border-neon-500/20 px-5 py-3 text-xs font-bold text-neon-400 hover:bg-neon-500/25 transition-all shadow-lg active:scale-95"
                    >
                      <UserPlus className="h-4 w-4" />Nuevo Acceso
                    </button>
                  </div>

                  <AnimatePresence>
                    {showCreateUser && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <GlassCard className="space-y-4 border-neon-500/20 bg-neon-500/[0.02] shadow-2xl shadow-neon-500/10">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                              <label className="mb-1 block text-[11px] font-bold text-text-muted uppercase tracking-widest">Nombre del Usuario</label>
                              <input className={inputClass} placeholder="Ej: Administrador Napz" value={usNombre} onChange={(e) => setUsNombre(e.target.value)} />
                            </div>
                            <div>
                              <label className="mb-1 block text-[11px] font-bold text-text-muted uppercase tracking-widest">Email de Acceso</label>
                              <input className={inputClass} placeholder="login@sistema.com" type="email" value={usEmail} onChange={(e) => setUsEmail(e.target.value)} />
                            </div>
                            <div>
                              <label className="mb-1 block text-[11px] font-bold text-text-muted uppercase tracking-widest">Contraseña Inicial</label>
                              <input className={inputClass} placeholder="Min. 6 caracteres" type="password" value={usPassword} onChange={(e) => setUsPassword(e.target.value)} />
                            </div>
                            <div>
                              <label className="mb-1 block text-[11px] font-bold text-text-muted uppercase tracking-widest">Rol del Usuario</label>
                              <select className={cn(inputClass, 'bg-[#0A0A1F]')} value={usRol} onChange={(e) => setUsRol(e.target.value)}>
                                <option value="cliente">Cliente (Vista de Leads)</option>
                                <option value="agencia">Agencia (Gestor de Pipeline)</option>
                              </select>
                            </div>
                          </div>
                          
                          {/* Auto-filled details info */}
                          <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                            <div className="flex-1">
                              <p className="text-[9px] text-text-muted uppercase font-black mb-1 opacity-50">Agencia Propietaria</p>
                              <p className="text-xs font-mono text-violet-400 bg-violet-500/5 px-2 py-1 rounded w-fit">{selectedAgencia.nombre} ({selectedAgencia.id.slice(0, 8)})</p>
                            </div>
                            <div className="flex-1">
                              <p className="text-[9px] text-text-muted uppercase font-black mb-1 opacity-50">Cliente Asignado</p>
                              <p className="text-xs font-mono text-neon-400 bg-neon-500/5 px-2 py-1 rounded w-fit">{selectedCliente.nombre} ({selectedCliente.id.slice(0, 8)})</p>
                            </div>
                          </div>

                          <div className="flex justify-end gap-3 pt-2">
                            <button onClick={() => setShowCreateUser(false)} className="px-5 py-2 text-xs text-text-muted hover:text-text-primary transition-colors">Cancelar</button>
                            <button 
                              onClick={handleCreateUsuario} 
                              disabled={creatingUs} 
                              className="rounded-xl bg-neon-500 px-10 py-3 text-xs font-black text-white uppercase tracking-[0.2em] shadow-2xl shadow-neon-500/30 hover:scale-105 active:scale-95 transition-all"
                            >
                              {creatingUs ? 'Generando...' : 'CREAR ACCESO'}
                            </button>
                          </div>
                        </GlassCard>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="grid grid-cols-1 gap-3">
                    {usuarios.filter(u => u.clienteId === selectedCliente.id).map((u) => (
                      <GlassCard key={u.uid} className="flex items-center justify-between p-5 group hover:bg-white/[0.03] transition-all border-white/5 hover:border-neon-500/20">
                        <div className="flex items-center gap-5">
                          <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 group-hover:bg-neon-500/10 group-hover:border-neon-500/20 transition-all">
                            <User className="h-6 w-6 text-text-muted group-hover:text-neon-400 transition-colors" />
                          </div>
                          <div>
                            <h4 className="text-base font-bold text-text-primary group-hover:text-white transition-colors">{u.nombre}</h4>
                            <div className="flex items-center gap-3">
                               <p className="text-xs text-text-muted">{u.email}</p>
                               <span className="w-1.5 h-1.5 rounded-full bg-border-subtle opacity-30" />
                               <span className={cn(
                                 "text-[10px] uppercase font-black tracking-widest",
                                 u.rol === 'agencia' ? "text-violet-400" : "text-neon-400"
                               )}>
                                 {u.rol}
                               </span>
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleDeleteUsuario(u.uid)}
                          className="p-3 text-text-muted/20 hover:text-red-400 hover:bg-red-400/10 rounded-2xl transition-all active:scale-90"
                          title="Revocar Acceso"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </GlassCard>
                    ))}
                    
                    {usuarios.filter(u => u.clienteId === selectedCliente.id).length === 0 && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-20 bg-white/[0.01] border border-dashed border-white/5 rounded-[2.5rem]"
                      >
                        <Shield className="h-10 w-10 text-white/5 mx-auto mb-4" />
                        <p className="text-sm text-text-muted font-display uppercase tracking-widest opacity-40">Sin accesos configurados</p>
                      </motion.div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            /* VISTA 1: LISTA MAESTRA DE AGENCIAS */
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-display font-black text-text-primary tracking-tighter uppercase">Gestión Global</h2>
                  <p className="text-xs text-text-muted font-medium opacity-60">Control maestro de agencias y licenciamiento</p>
                </div>
                <button
                  onClick={() => setShowCreateAg(true)}
                  className="flex items-center gap-2 rounded-2xl bg-neon-500/15 border border-neon-500/20 px-6 py-3 text-xs font-black text-neon-400 hover:bg-neon-500/25 transition-all shadow-xl active:scale-95 uppercase tracking-widest"
                >
                  <Plus className="h-4 w-4" />Nueva Agencia
                </button>
              </div>

              <AnimatePresence>
                {showCreateAg && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <GlassCard className="space-y-5 border-neon-500/20 shadow-2xl shadow-neon-500/5 bg-neon-500/[0.01]">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Nombre Comercial</label>
                          <input className={inputClass} placeholder="Ej: Marketing Pro" value={agNombre} onChange={(e) => setAgNombre(e.target.value)} />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Email Corporativo</label>
                          <input className={inputClass} placeholder="admin@agencia.com" value={agEmail} onChange={(e) => setAgEmail(e.target.value)} />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Nivel de Servicio</label>
                          <select className={cn(inputClass, 'bg-[#0A0A1F]')} value={agPlan} onChange={(e) => setAgPlan(e.target.value)}>
                            <option value="basic">Standard Plan</option>
                            <option value="premium">Premium Suite</option>
                            <option value="enterprise">Enterprise VIP</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex justify-end gap-3 pt-2">
                        <button onClick={() => setShowCreateAg(false)} className="px-6 py-2 text-xs font-bold text-text-muted hover:text-text-primary transition-colors">Cancelar</button>
                        <button onClick={handleCreateAgencia} disabled={creatingAg} className="rounded-xl bg-neon-500 px-10 py-3 text-xs font-black text-white shadow-2xl shadow-neon-500/20 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest">
                          {creatingAg ? 'Dando de Alta...' : 'REGISTRAR AGENCIA'}
                        </button>
                      </div>
                    </GlassCard>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-1 gap-4">
                {agencias.map((ag) => (
                  <GlassCard 
                    key={ag.id} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 cursor-pointer hover:border-violet-500/40 transition-all group relative overflow-hidden active:scale-[0.99] p-6 bg-white/[0.01] hover:bg-white/[0.03]"
                    onClick={() => setSelectedAgencia(ag)}
                  >
                    <div className="flex items-center gap-6">
                      <div className="flex h-16 w-16 items-center justify-center rounded-[1.25rem] bg-violet-600/10 group-hover:bg-violet-600/20 border border-violet-500/10 transition-all shadow-xl group-hover:scale-110">
                        <Building2 className="h-8 w-8 text-violet-400" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-lg font-display font-black text-text-primary group-hover:text-white transition-colors uppercase tracking-tight">{ag.nombre}</h4>
                        <p className="text-xs text-text-muted font-body mb-2">{ag.email}</p>
                        <div className="flex items-center gap-3">
                          <span className="rounded-lg px-2.5 py-1 bg-white/5 text-[9px] font-mono text-text-muted/60 border border-white/5 uppercase tracking-tighter">
                            UID: {ag.id.slice(0, 16)}...
                          </span>
                          <span className={cn(
                            "rounded-lg px-3 py-1 text-[9px] font-black uppercase tracking-widest border shadow-sm",
                            ag.estadoLicencia === 'activo' 
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/5" 
                              : "bg-red-500/10 text-red-400 border-red-500/20 shadow-red-500/5"
                          )}>
                            {ag.estadoLicencia}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
                       <div className="flex items-center bg-white/5 p-1 rounded-2xl border border-white/5 shadow-inner">
                          <button
                            onClick={() => handleToggleLicencia(ag.id, ag.estadoLicencia)}
                            className={cn(
                              "p-3 rounded-xl transition-all flex items-center gap-2",
                              ag.estadoLicencia === 'activo' ? "text-emerald-400 hover:bg-emerald-500/10" : "text-text-muted hover:bg-white/10"
                            )}
                            title={ag.estadoLicencia === 'activo' ? 'Suspender Acceso' : 'Habilitar Acceso'}
                          >
                            {ag.estadoLicencia === 'activo' ? <ToggleRight className="h-7 w-7" /> : <ToggleLeft className="h-7 w-7 opacity-40" />}
                          </button>
                          <button 
                            onClick={() => handleDeleteAgencia(ag.id)}
                            className="p-3 rounded-xl text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-all"
                            title="Eliminar de Raíz"
                          >
                            <Trash2 className="h-6 w-6 opacity-40 hover:opacity-100" />
                          </button>
                       </div>
                      <div className="w-12 h-12 flex items-center justify-center border-l border-white/5 ml-2 group-hover:bg-white/5 transition-colors rounded-r-2xl">
                        <ChevronRight className="h-6 w-6 text-text-muted group-hover:text-neon-400 transform group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </GlassCard>
                ))}
                
                {agencias.length === 0 && !loadingAg && (
                  <div className="text-center py-20 opacity-20 bg-white/[0.01] rounded-[3rem] border border-dashed border-white/5">
                    <Building2 className="h-16 w-16 mx-auto mb-4" />
                    <p className="font-display uppercase tracking-widest text-sm">Cámara Acorazada Vacía</p>
                  </div>
                )}
              </div>
            </motion.div>
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
