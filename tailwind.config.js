/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{html,ts}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: '#0F172A',
          deep: '#0B1120',
        },
        surface: {
          card: '#1E293B',
          border: '#334155',
          hover: '#27354A',
          overlay: '#182234',
        },
        primary: {
          DEFAULT: '#6366F1',
          hover: '#4F46E5',
          focus: '#818CF8',
          light: 'rgba(99, 102, 241, 0.12)',
          border: 'rgba(99, 102, 241, 0.3)',
        },
        secondary: {
          DEFAULT: '#8B5CF6',
          hover: '#7C3AED',
          light: 'rgba(139, 92, 246, 0.12)',
          border: 'rgba(139, 92, 246, 0.3)',
        },
        accentCyan: {
          DEFAULT: '#06B6D4',
          light: 'rgba(6, 182, 212, 0.12)',
          border: 'rgba(6, 182, 212, 0.3)',
        },
        p1: {
          DEFAULT: '#EF4444',
          light: 'rgba(239, 68, 68, 0.12)',
          border: 'rgba(239, 68, 68, 0.3)',
        },
        p2: {
          DEFAULT: '#F59E0B',
          light: 'rgba(245, 158, 11, 0.12)',
          border: 'rgba(245, 158, 11, 0.3)',
        },
        p3: {
          DEFAULT: '#3B82F6',
          light: 'rgba(59, 130, 246, 0.12)',
          border: 'rgba(59, 130, 246, 0.3)',
        },
        p4: {
          DEFAULT: '#94A3B8',
          light: 'rgba(148, 163, 184, 0.12)',
          border: 'rgba(148, 163, 184, 0.3)',
        },
        success: {
          DEFAULT: '#10B981',
          light: 'rgba(16, 185, 129, 0.12)',
          border: 'rgba(16, 185, 129, 0.3)',
        },
        opsText: {
          primary: '#F8FAFC',
          secondary: '#CBD5E1',
          muted: '#64748B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
        display: ['Geist', 'Inter', 'sans-serif'],
      },
      keyframes: {
        pulseDot: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.3', transform: 'scale(0.85)' },
        },
      },
      animation: {
        'pulse-dot': 'pulseDot 1.6s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
