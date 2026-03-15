'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ChevronRight, ChevronLeft, Kanban, BarChart3, 
  MousePointer2, Zap, Target, Trophy, Clock, Calendar,
  Filter, HelpCircle, Layout
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
    title: 'Guía del Pipeline',
    description: 'Aprende a gestionar tus leads como un experto con nuestro sistema de 8 etapas.',
    icon: Layout,
    color: '#0A84FF',
    content: (
      <div className="space-y-4">
        <p className="text-sm text-text-secondary leading-relaxed">
          Tu dashboard está dividido en etapas lógicas que siguen el viaje de tu cliente desde el primer contacto hasta el cierre.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {STAGES.map(s => (
            <div key={s.id} className="flex items-center gap-2 p-2 rounded-xl bg-bg-primary/30 border border-border-subtle">
              <span className="text-lg">{s.emoji}</span>
              <span className="text-[10px] font-bold uppercase tracking-tight text-text-primary truncate">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    )
  },
  {
    id: 'movement',
    title: 'Gestión y Movimiento',
    description: 'Tienes libertad total para mover tus leads en cualquier momento.',
    icon: MousePointer2,
    color: '#8B5CF6',
    content: (
      <div className="space-y-4">
        <div className="p-4 rounded-2xl bg-bg-primary/40 border border-border-subtle space-y-3">
          <div className="flex items-start gap-3">
            <div className="mt-1 h-5 w-5 rounded-lg bg-neon-500/10 flex items-center justify-center text-neon-400">
               <Zap className="h-3.5 w-3.5" />
            </div>
            <div>
              <p className="text-xs font-bold text-text-primary">Arrastre (Drag & Drop)</p>
              <p className="text-[11px] text-text-muted">Simplemente arrastra una tarjeta de una columna a otra en tu ordenador.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-1 h-5 w-5 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
               <Target className="h-3.5 w-3.5" />
            </div>
            <div>
              <p className="text-xs font-bold text-text-primary">Selector Rápido</p>
              <p className="text-[11px] text-text-muted">En el panel de detalle o en el menú de la tarjeta, usa los botones directos para cambiar de etapa con un click.</p>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'analytics',
    title: 'Analítica Inteligente',
    description: 'Mide tu rendimiento basándote en datos reales y rangos de fecha.',
    icon: BarChart3,
    color: '#F59E0B',
    content: (
      <div className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-bg-primary/30 border border-border-subtle">
             <Calendar className="h-5 w-5 text-neon-400" />
             <p className="text-[11px] text-text-secondary">Usa el selector <b>Desde/Hasta</b> para ver leads de periodos específicos.</p>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-bg-primary/30 border border-border-subtle">
             <Zap className="h-5 w-5 text-blue-400" />
             <p className="text-[11px] text-text-secondary">Observa el <b>Embudo</b> para identificar dónde se estancan tus leads.</p>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-bg-primary/30 border border-border-subtle">
             <Trophy className="h-5 w-5 text-emerald-400" />
             <p className="text-[11px] text-text-secondary">Revisa el <b>Rendimiento Total</b> para ver tu tasa de éxito global.</p>
          </div>
        </div>
      </div>
    )
  }
];

export function HelpGuide({ open, onClose }: HelpGuideProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const next = () => setCurrentSlide(prev => Math.min(prev + 1, SLIDES.length - 1));
  const prev = () => setCurrentSlide(prev => Math.max(prev - 1, 0));

  const slide = SLIDES[currentSlide];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed left-1/2 top-1/2 z-[101] w-[92%] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[2rem] border border-white/20 bg-bg-primary shadow-2xl backdrop-blur-3xl"
          >
            {/* Header */}
            <div className="relative h-28 w-full overflow-hidden">
              <div 
                className="absolute inset-0 opacity-30 blur-3xl transition-colors duration-500"
                style={{ backgroundColor: slide.color }}
              />
              <div className="relative flex h-full items-center justify-between px-6 sm:px-8">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div 
                    className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl shadow-lg transition-all duration-500"
                    style={{ backgroundColor: `${slide.color}30`, color: slide.color, border: `1px solid ${slide.color}40` }}
                  >
                    <slide.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-display font-bold text-text-primary tracking-tight">{slide.title}</h2>
                    <p className="text-[10px] font-mono text-text-muted uppercase tracking-widest leading-none">Guía de Usuario</p>
                  </div>
                </div>
                <button 
                  onClick={onClose}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-text-muted hover:bg-white/20 hover:text-text-primary transition-all"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="px-8 py-6">
              <p className="mb-6 text-sm text-text-secondary/80 font-body">
                {slide.description}
              </p>
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={slide.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {slide.content}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer / Nav */}
            <div className="border-t border-white/5 bg-white/[0.02] px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex gap-1.5">
                  {SLIDES.map((_, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "h-1.5 rounded-full transition-all duration-300",
                        i === currentSlide ? "w-6" : "w-1.5 bg-white/10"
                      )}
                      style={{ backgroundColor: i === currentSlide ? slide.color : undefined }}
                    />
                  ))}
                </div>
                
                <div className="flex items-center gap-3">
                  {currentSlide > 0 && (
                    <button 
                      onClick={prev}
                      className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-text-secondary hover:text-text-primary transition-all"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Atrás
                    </button>
                  )}
                  <button 
                    onClick={currentSlide === SLIDES.length - 1 ? onClose : next}
                    className="flex items-center gap-2 rounded-xl px-6 py-2 text-xs font-semibold text-white shadow-lg transition-all hover:brightness-110 active:scale-95"
                    style={{ backgroundColor: slide.color }}
                  >
                    <span>{currentSlide === SLIDES.length - 1 ? 'Empezar' : 'Siguiente'}</span>
                    {currentSlide < SLIDES.length - 1 && <ChevronRight className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
