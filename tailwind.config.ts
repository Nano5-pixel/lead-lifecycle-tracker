import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: 'var(--bg-primary)',
          secondary: 'var(--bg-secondary)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          'on-color': '#FFFFFF',
        },
        border: {
          subtle: 'var(--border-subtle)',
        },
        navy: {
          950: '#04080F',
          900: '#0A1128',
          800: '#0F1B3D',
          700: '#162452',
          600: '#1D2D66',
          500: '#24367B',
        },
        neon: {
          50: '#E8F4FE',
          100: '#B8DFFC',
          200: '#88CAF9',
          300: '#58B5F7',
          400: '#2EA0F4',
          500: 'var(--accent-neon)',
          600: '#0866CC',
          700: '#064999',
        },
        emerald: {
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
        },
        stage: {
          nuevo: '#0A84FF',
          contacto: '#F59E0B',
          calificado: '#8B5CF6',
          propuesta: '#06B6D4',
          ganado: '#10B981',
          perdido: '#EF4444',
        },
      },
      fontFamily: {
        display: ['Outfit', 'system-ui', 'sans-serif'],
        body: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0, 0, 0, 0.25)',
        neon: '0 0 20px rgba(10, 132, 255, 0.3)',
        emerald: '0 0 20px rgba(16, 185, 129, 0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        shimmer: 'shimmer 2s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
