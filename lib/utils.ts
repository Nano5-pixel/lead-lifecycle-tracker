import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind classes */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formatear fecha para mostrar */
export function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  try {
    return new Intl.DateTimeFormat('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

/** Generar enlace de WhatsApp */
export function whatsappLink(phone: string, message?: string): string {
  const clean = phone.replace(/\D/g, '');
  const msg = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${clean}${msg}`;
}

/** Generar enlace tel: */
export function phoneLink(phone: string): string {
  return `tel:${phone.replace(/\D/g, '')}`;
}

/** Generar API key aleatoria */
export function generateApiKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let key = 'llt_';
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}
