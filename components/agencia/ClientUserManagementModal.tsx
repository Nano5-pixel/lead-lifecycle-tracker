'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Key, Trash2, Loader2, User, Mail, ShieldCheck } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { useUsuarios } from '@/hooks/useUsuarios';
import { useAuth } from '@/hooks/useAuth';
import { Cliente, AppUser } from '@/types';
import { cn } from '@/lib/utils';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '../ui/Toast';

interface ClientUserManagementModalProps {
  open: boolean;
  onClose: () => void;
  cliente: Cliente | null;
  agenciaId: string;
}

export function ClientUserManagementModal({
  open,
  onClose,
  cliente,
  agenciaId,
}: ClientUserManagementModalProps) {
  const { usuarios, loading, createUsuarioDoc, deleteUsuario } = useUsuarios();
  const { toast } = useToast();
  const [showCreate, setShowCreate] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [creating, setCreating] = useState(false);

  // Filtrar solo los usuarios de este cliente específico
  const clientUsers = usuarios.filter(u => u.clienteId === cliente?.id);

  const handleCreateUser = async () => {
    if (!email.trim() || !password.trim() || !nombre.trim() || !cliente) return;
    setCreating(true);
    try {
      // 1. Crear en Firebase Auth
      // Nota: Esto creará el usuario en Firebase Auth. 
      // Si el administrador está logueado, esto podría cerrar su sesión si no se usa una Admin SDK o una función de Edge.
      // Sin embargo, para este MVP y dado el diseño actual, seguiremos este flujo.
      // ADVERTENCIA: createUserWithEmailAndPassword asocia el nuevo usuario a la sesión actual si se hace en el cliente.
      // MEJOR ENFOQUE: Usar una API en el servidor para crear el usuario en Auth sin afectar la sesión.
      
      const response = await fetch('/api/admin/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          nombre,
          rol: 'cliente',
          agenciaId,
          clienteId: cliente.id
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Error al crear usuario');
      }

      toast(`Acceso creado para ${nombre}`, 'success');
      setEmail('');
      setPassword('');
      setNombre('');
      setShowCreate(false);
    } catch (err: any) {
      toast(err.message || 'Error al crear acceso', 'error');
    }
    setCreating(false);
  };

  const handleDeleteUser = async (uid: string) => {
    if (!confirm('¿Estás seguro de eliminar este acceso? El cliente ya no podrá entrar.')) return;
    const ok = await deleteUsuario(uid);
    if (ok) toast('Acceso eliminado', 'success');
    else toast('Error al eliminar acceso', 'error');
  };

  const inputClass = cn(
    'w-full rounded-xl bg-bg-primary/30 border border-border-subtle px-4 py-2 text-sm text-text-primary placeholder:text-text-muted transition-all focus:outline-none focus:border-neon-500/40'
  );

  if (!open || !cliente) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg"
      >
        <GlassCard className="overflow-hidden" noPadding>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border-subtle p-5 bg-bg-primary/50">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neon-500/15">
                <ShieldCheck className="h-5 w-5 text-neon-400" />
              </div>
              <div>
                <h2 className="text-lg font-display font-semibold text-text-primary">Accesos: {cliente.nombre}</h2>
                <p className="text-[11px] text-text-muted font-body">Gestiona quién puede ver estos leads</p>
              </div>
            </div>
            <button onClick={onClose} className="rounded-lg p-2 text-text-muted hover:bg-bg-primary hover:text-text-primary transition-all">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-5 space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Lista de usuarios actuales */}
            <div className="space-y-3">
              <h3 className="text-[11px] font-mono uppercase tracking-wider text-text-muted">Usuarios con Acceso</h3>
              {loading ? (
                <div className="flex justify-center py-4"><Loader2 className="h-6 w-6 text-neon-500 animate-spin" /></div>
              ) : clientUsers.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-border-subtle rounded-xl">
                  <User className="h-8 w-8 text-text-muted/20 mx-auto mb-2" />
                  <p className="text-sm text-text-muted">No hay usuarios creados para este cliente</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {clientUsers.map((u) => (
                    <div key={u.uid} className="flex items-center justify-between p-3 rounded-xl bg-bg-primary/20 border border-border-subtle">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-bg-primary/50">
                          <User className="h-4 w-4 text-text-muted" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text-primary">{u.nombre}</p>
                          <p className="text-[11px] text-text-muted font-body flex items-center gap-1">
                            <Mail className="h-3 w-3" /> {u.email}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDeleteUser(u.uid)}
                        className="p-2 text-text-muted/40 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Crear nuevo usuario */}
            <div className="space-y-4">
              {!showCreate ? (
                <button
                  onClick={() => setShowCreate(true)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-neon-500/10 border border-neon-500/20 py-3 text-xs font-semibold text-neon-400 hover:bg-neon-500/20 transition-all"
                >
                  <UserPlus className="h-4 w-4" />
                  Crear Nuevo Acceso
                </button>
              ) : (
                <GlassCard className="border-neon-500/20 bg-neon-500/[0.02] space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-text-primary">Nuevo Usuario</h4>
                    <button onClick={() => setShowCreate(false)} className="text-text-muted hover:text-text-primary">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="mb-1 block text-[10px] text-text-muted uppercase font-mono">Nombre</label>
                      <input className={inputClass} placeholder="Nombre del cliente" value={nombre} onChange={(e) => setNombre(e.target.value)} />
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] text-text-muted uppercase font-mono">Email</label>
                      <input className={inputClass} placeholder="email@ejemplo.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] text-text-muted uppercase font-mono">Contraseña</label>
                      <input className={inputClass} placeholder="Mín. 6 caracteres" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setShowCreate(false)} className="flex-1 py-2 text-xs font-medium text-text-muted hover:bg-bg-primary rounded-xl transition-all">Cancelar</button>
                    <button 
                      onClick={handleCreateUser}
                      disabled={creating || !email.trim() || !password.trim() || !nombre.trim()}
                      className="flex-[2] bg-neon-500 py-2 text-xs font-semibold text-white rounded-xl hover:bg-neon-400 transition-all disabled:opacity-50"
                    >
                      {creating ? 'Creando...' : 'Crear Acceso'}
                    </button>
                  </div>
                </GlassCard>
              )}
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
