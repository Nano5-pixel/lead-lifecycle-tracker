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
            className="relative z-[101] w-full max-w-lg max-h-[90vh] overflow-hidden rounded-[2.5rem] border border-white/20 bg-bg-primary shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="relative h-28 flex-shrink-0 w-full overflow-hidden border-b border-white/5">
              <div 
                className="absolute inset-0 opacity-40 blur-3xl transition-colors duration-500"
                style={{ backgroundColor: slide.color }}
              />
              <div className="relative flex h-full items-center justify-between px-6 sm:px-10">
                <div className="flex items-center gap-4">
                  <div 
                    className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-xl transition-all duration-500"
                    style={{ backgroundColor: `${slide.color}40`, color: slide.color, border: `1px solid ${slide.color}50` }}
                  >
                    <slide.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-display font-bold text-text-primary tracking-tight leading-none">{slide.title}</h2>
                    <p className="mt-1 text-[10px] font-mono text-text-muted uppercase tracking-widest leading-none">Guía de Usuario</p>
                  </div>
                </div>
                <button 
                  onClick={onClose}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all border border-white/10"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 sm:px-10 py-8 custom-scrollbar">
              <p className="mb-8 text-sm sm:text-base text-text-secondary/90 font-body leading-relaxed">
                {slide.description}
              </p>
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={slide.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {slide.content}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer / Nav */}
            <div className="flex-shrink-0 border-t border-white/5 bg-white/[0.03] px-6 sm:px-10 py-6">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {SLIDES.map((_, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "h-2 rounded-full transition-all duration-300",
                        i === currentSlide ? "w-8" : "w-2 bg-white/10"
                      )}
                      style={{ backgroundColor: i === currentSlide ? slide.color : undefined }}
                    />
                  ))}
                </div>
                
                <div className="flex items-center gap-4">
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
                    className="flex items-center gap-2 rounded-xl px-8 py-3 text-xs font-black uppercase tracking-wider text-white shadow-2xl transition-all hover:brightness-110 active:scale-95"
                    style={{ 
                      backgroundColor: slide.color,
                      boxShadow: `0 8px 30px ${slide.color}40`
                    }}
                  >
                    <span>{currentSlide === SLIDES.length - 1 ? '¡Entendido!' : 'Siguiente'}</span>
                    {currentSlide < SLIDES.length - 1 && <ChevronRight className="h-4 w-4" />}
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
