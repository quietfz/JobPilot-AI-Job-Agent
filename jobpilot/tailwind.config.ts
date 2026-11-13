import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#EEF1FF',
          100: '#DCE2FF',
          200: '#BCC7FF',
          300: '#94A4FF',
          400: '#6C7DFF',
          500: '#2F4BFF',
          600: '#2438D9',
          700: '#1D2CAB',
          800: '#182482',
          900: '#141E66',
        },
        ink: {
          900: '#0E1222',
          700: '#2A3048',
          600: '#434A62',
          500: '#5A627A',
          400: '#8C93A8',
          300: '#B9C0D4',
          200: '#E4E7F0',
          100: '#EDF0F7',
          50: '#F5F6FA',
        },
        hit: '#0E9F6E',
        partial: '#C2760A',
        gap: '#E11D48',
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"PingFang SC"',
          '"Microsoft YaHei"',
          '"Segoe UI"',
          'sans-serif',
        ],
        mono: ['"SF Mono"', 'Menlo', 'Consolas', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(14,18,34,0.04), 0 12px 32px -20px rgba(14,18,34,0.18)',
        lift: '0 2px 6px rgba(14,18,34,0.05), 0 24px 48px -24px rgba(47,75,255,0.24)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.15' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseRing: {
          '0%': { transform: 'scale(0.9)', opacity: '0.6' },
          '100%': { transform: 'scale(1.6)', opacity: '0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.45s cubic-bezier(0.22,1,0.36,1) both',
        'fade-in': 'fade-in 0.35s ease both',
        blink: 'blink 1s steps(2, start) infinite',
        shimmer: 'shimmer 1.8s linear infinite',
        'pulse-ring': 'pulseRing 1.8s ease-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
