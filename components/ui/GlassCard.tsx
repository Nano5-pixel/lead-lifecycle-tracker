'use client';

import { cn } from '@/lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  className?: string;
  hoverGlow?: boolean;
  glowColor?: string;
  noPadding?: boolean;
}

export function GlassCard({
  children,
  className,
  hoverGlow = false,
  glowColor = 'rgba(10, 132, 255, 0.15)',
  noPadding = false,
  ...motionProps
}: GlassCardProps) {
  return (
    <motion.div
      className={cn(
        'relative rounded-2xl border border-white/[0.08]',
        'bg-white/[0.04] backdrop-blur-xl',
        'shadow-[0_8px_32px_rgba(0,0,0,0.25)]',
        !noPadding && 'p-5',
        className
      )}
      whileHover={
        hoverGlow
          ? { boxShadow: `0 8px 32px rgba(0,0,0,0.25), 0 0 30px ${glowColor}` }
          : undefined
      }
      {...motionProps}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-t-2xl" />
      {children}
    </motion.div>
  );
}
