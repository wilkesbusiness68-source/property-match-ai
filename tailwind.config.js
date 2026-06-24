/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#6366F1',
          50: '#EEF2FF',
          100: '#E0E7FF',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
        },
        slate: {
          25: '#F8FAFC',
          50: '#F1F5F9',
          100: '#E2E8F0',
          200: '#CBD5E1',
          300: '#94A3B8',
          400: '#64748B',
          500: '#475569',
          600: '#334155',
          700: '#1E293B',
          800: '#0F172A',
          900: '#020617',
        },
        match: {
          excellent: '#16A34A',
          'excellent-bg': '#F0FDF4',
          'excellent-border': '#BBF7D0',
          strong: '#D97706',
          'strong-bg': '#FFFBEB',
          'strong-border': '#FDE68A',
          poor: '#DC2626',
          'poor-bg': '#FEF2F2',
          'poor-border': '#FECACA',
        },
      },
    },
  },
  plugins: [],
}
