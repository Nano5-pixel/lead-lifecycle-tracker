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
        'relative rounded-2xl border border-glass-border',
        'bg-glass-bg backdrop-blur-xl',
        'shadow-glass',
        !noPadding && 'p-5',
        className
      )}
      whileHover={
        hoverGlow
          ? { boxShadow: `0 8px 32px rgba(0,0,0,0.15), 0 0 30px ${glowColor}` }
          : undefined
      }
      {...motionProps}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-text-primary/10 to-transparent rounded-t-2xl" />
      {children}
    </motion.div>
  );
}
