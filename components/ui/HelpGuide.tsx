'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ChevronRight, ChevronLeft, Kanban, BarChart3, 
  MousePointer2, Zap, Target, Trophy, Clock, Calendar,
  Filter, HelpCircle, Layout, Users, MessageSquare,
  ShieldCheck, TrendingUp, AlertCircle, Sparkles, CheckCircle2
} from 'lucide-react';
import { STAGES } from '@/lib/stages';
import { cn } from '@/lib/utils';

interface HelpGuideProps {
  open: boolean;
  onClose: () => void;
}

const SLIDES = [
  {
    id: 'intro',
    title: '¿Qué es un CRM?',
    description: 'La herramienta definitiva para escalar tu negocio y no perder ventas.',
    icon: Layout,
    color: '#0A84FF',
    content: (
      <div className="space-y-4">
        <p className="text-sm text-text-secondary leading-relaxed">
          Un **CRM** (Customer Relationship Management) es la &quot;memoria&quot; de tu empresa. Centraliza todos tus prospectos (leads) para que **ninguna oportunidad se pierda** por falta de seguimiento.
        </p>
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/5">
             <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                <Users className="h-4 w-4" />
             </div>
             <p className="text-[11px] text-text-secondary font-medium">Olvídate de las hojas de cálculo y WhatsApps perdidos.</p>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/5">
             <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
             </div>
             <p className="text-[11px] text-text-secondary font-medium">Todo tu equipo trabajando en un mismo lugar seguro.</p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'lifecycle',
    title: 'El Ciclo de Vida del Lead',
    description: 'Tu proceso comercial tiene etapas lógicas. Entenderlas es clave.',
    icon: TrendingUp,
    color: '#8B5CF6',
    content: (
      <div className="space-y-4">
        <p className="text-[11px] text-text-muted leading-relaxed italic">
          Tu objetivo es mover cada lead desde la izquierda (Nuevo) hasta el cierre comercial exitoso (Ganado).
        </p>
        <div className="grid grid-cols-2 gap-2">
          {STAGES.filter(s => !['Basura', 'Perdido'].includes(s.id)).map(s => (
            <div key={s.id} className="flex items-center gap-2 p-2 rounded-xl bg-bg-primary/30 border border-border-subtle group hover:border-violet-500/30 transition-colors">
              <span className="text-lg group-hover:scale-110 transition-transform">{s.emoji}</span>
              <span className="text-[10px] font-bold uppercase tracking-tight text-text-primary truncate">{s.label}</span>
            </div>
          ))}
        </div>
        <div className="p-3 rounded-xl bg-violet-500/5 border border-violet-500/10">
          <p className="text-[10px] text-violet-300 font-medium">Cada etapa representa un compromiso mayor del cliente con tu oferta.</p>
        </div>
      </div>
    )
  },
  {
    id: 'ops',
    title: 'Dominando el Tablero',
    description: 'Gestiona leads con agilidad y precisión total.',
    icon: MousePointer2,
    color: '#F59E0B',
    content: (
      <div className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/5">
             <div className="mt-1 h-6 w-6 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                <Zap className="h-3.5 w-3.5" />
             </div>
             <div>
               <p className="text-xs font-bold text-text-primary">Mover es ganar</p>
               <p className="text-[10px] text-text-muted">Arrastra las tarjetas o usa el selector rápido en el panel de detalle.</p>
             </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/5">
             <div className="mt-1 h-6 w-6 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                <MessageSquare className="h-3.5 w-3.5" />
             </div>
             <div>
               <p className="text-xs font-bold text-text-primary">Notas de Seguimiento</p>
               <p className="text-[10px] text-text-muted">**REGLA DE ORO**: Si no está anotado, no pasó. Deja registro de cada llamada o WP.</p>
             </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/5">
             <div className="mt-1 h-6 w-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
             </div>
             <div>
               <p className="text-xs font-bold text-text-primary">Efectividad</p>
               <p className="text-[10px] text-text-muted">El sistema sella la fecha de cada hito automáticamente para tu analítica.</p>
             </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'analytics',
    title: 'Analítica de Alto Nivel',
    description: 'Toma decisiones basadas en datos, no en suposiciones.',
    icon: BarChart3,
    color: '#10B981',
    content: (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3">
          <div className="p-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5">
            <h4 className="text-xs font-bold text-emerald-400 mb-1 flex items-center gap-2">
              <Target className="h-3.5 w-3.5" /> Tasa de Conversión Real
            </h4>
            <p className="text-[11px] text-text-secondary">Mira cuántos de tus leads totales se convierten en dinero.</p>
          </div>
          <div className="p-3 rounded-2xl border border-red-500/20 bg-red-500/5">
            <h4 className="text-xs font-bold text-red-400 mb-1 flex items-center gap-2">
              <AlertCircle className="h-3.5 w-3.5" /> Análisis de Pérdida
            </h4>
            <p className="text-[11px] text-text-secondary">¿Tus leads son malos o falló la venta? Separa **Perdido** de **Basura**.</p>
          </div>
          <div className="p-3 rounded-2xl border border-blue-500/20 bg-blue-500/5">
            <h4 className="text-xs font-bold text-blue-400 mb-1 flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5" /> Rendimiento de Equipo
            </h4>
            <p className="text-[11px] text-text-secondary">Compara quién cierra más y quién necesita apoyo comercial.</p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'success',
    title: '3 Secretos para el Éxito',
    description: 'Si sigues estas reglas, tus ventas subirán de nivel.',
    icon: Trophy,
    color: '#F59E0B',
    content: (
      <div className="space-y-4">
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="h-8 w-8 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-xs">1</div>
            <div>
              <p className="text-xs font-bold text-text-primary uppercase">Rapidez Explosiva</p>
              <p className="text-[11px] text-text-muted">Contactar a un lead en menos de **5 minutos** aumenta la conversión un 400%.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="h-8 w-8 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-xs">2</div>
            <div>
              <p className="text-xs font-bold text-text-primary uppercase">Limpieza Profunda</p>
              <p className="text-[11px] text-text-muted">No tengas miedo a descartar &quot;Basura&quot; rápido. Enfócate solo en el oro.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="h-8 w-8 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-xs">3</div>
            <div>
              <p className="text-xs font-bold text-text-primary uppercase">Consistencia Total</p>
              <p className="text-[11px] text-text-muted">Abre el CRM todos los días. Si está en el panel, debe tener una acción hoy.</p>
            </div>
          </div>
        </div>
        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/20 text-center">
            <p className="text-[11px] font-bold text-amber-300">¡Empieza ahora y domina tu mercado!</p>
        </div>
      </div>
    )
  }
];

export function HelpGuide({ open, onClose }: HelpGuideProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const next = useCallback(() => setCurrentSlide(prev => Math.min(prev + 1, SLIDES.length - 1)), []);
  const prev = useCallback(() => setCurrentSlide(prev => Math.max(prev - 1, 0)), []);

  // Reset slide when opening
  useEffect(() => {
    if (open) setCurrentSlide(0);
  }, [open]);

  const slide = SLIDES[currentSlide];

  return (
    <AnimatePresence>
      {open && (
        <>
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative z-[101] w-full max-w-lg max-h-[90vh] overflow-hidden rounded-[2.5rem] border border-white/20 bg-[#060b18] shadow-2xl flex flex-col"
          >
            {/* Header Area */}
            <div className="relative h-32 flex-shrink-0 w-full overflow-hidden border-b border-white/5">
              <div 
                className="absolute inset-0 opacity-40 blur-3xl transition-colors duration-700"
                style={{ backgroundColor: slide.color }}
              />
              <div className="relative flex h-full items-center justify-between px-6 sm:px-10">
                <div className="flex items-center gap-5">
                  <motion.div 
                    key={`icon-${slide.id}`}
                    initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    className="flex h-14 w-14 items-center justify-center rounded-2xl shadow-2xl transition-all duration-500"
                    style={{ backgroundColor: `${slide.color}20`, color: slide.color, border: `1px solid ${slide.color}40` }}
                  >
                    <slide.icon className="h-7 w-7" />
                  </motion.div>
                  <div>
                    <h2 className="text-xl font-display font-bold text-text-primary tracking-tight leading-none">{slide.title}</h2>
                    <p className="mt-1.5 text-[10px] font-mono text-text-muted uppercase tracking-widest leading-none">Guía Estratégica</p>
                  </div>
                </div>
                <button 
                  onClick={onClose}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white/50 hover:text-white hover:bg-white/10 transition-all border border-white/5"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto px-6 sm:px-10 py-8 custom-scrollbar bg-white/[0.01]">
              <p className="mb-8 text-sm sm:text-[15px] text-text-secondary leading-relaxed font-body">
                {slide.description}
              </p>
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={slide.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="min-h-[220px]"
                >
                  {slide.content}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Bottom Controls */}
            <div className="flex-shrink-0 border-t border-white/5 bg-[#080e1d] px-6 sm:px-10 py-6">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {SLIDES.map((_, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "h-1.5 rounded-full transition-all duration-500",
                        i === currentSlide ? "w-10 bg-white" : "w-1.5 bg-white/10"
                      )}
                      style={{ backgroundColor: i === currentSlide ? slide.color : undefined }}
                    />
                  ))}
                </div>
                
                <div className="flex items-center gap-3">
                  {currentSlide > 0 && (
                    <button 
                      onClick={prev}
                      className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-text-secondary hover:text-text-primary transition-all"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Atrás
                    </button>
                  )}
                  <button 
                    onClick={currentSlide === SLIDES.length - 1 ? onClose : next}
                    className="flex items-center gap-2 rounded-xl px-8 py-3.5 text-[11px] font-black uppercase tracking-wider text-white shadow-2xl transition-all hover:brightness-110 active:scale-95 overflow-hidden relative group"
                    style={{ 
                      backgroundColor: slide.color,
                      boxShadow: `0 8px 30px ${slide.color}40`
                    }}
                  >
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="relative z-10">{currentSlide === SLIDES.length - 1 ? '¡Vamos a Vender!' : 'Siguiente'}</span>
                    {currentSlide < SLIDES.length - 1 && <ChevronRight className="relative z-10 h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        </>
      )}
    </AnimatePresence>
  );
}
