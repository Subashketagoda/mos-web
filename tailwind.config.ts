import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#09090B',
        foreground: '#F7F4EE',
        mosphere: {
          black: '#070709',
          charcoal: '#0E0E13',
          card: 'rgba(18, 18, 24, 0.75)',
          slate: '#1A1A22',
          cream: '#F7F4EE',
          ivory: '#FDFBF7',
          sand: '#EBE7DF',
          gold: '#D4AF37',
          goldLight: '#F3E5AB',
          goldDark: '#A38018',
          goldBorder: 'rgba(212, 175, 55, 0.28)',
          muted: '#8A8780',
          border: 'rgba(255, 255, 255, 0.08)',
        },
        negombo: {
          darkest: '#02180F',
          dark: '#042217',
          base: '#062A1D',
          light: '#0A3B29',
          lighter: '#0F4D36',
          card: 'rgba(6, 42, 29, 0.82)',
          border: 'rgba(229, 184, 66, 0.35)',
          gold: '#E5B842',
          goldLight: '#F3CC68',
          goldDark: '#9B7617',
          cream: '#FAF6ED',
        },
      },
      fontFamily: {
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        luxury: '0 20px 40px -15px rgba(0, 0, 0, 0.8)',
        goldGlow: '0 0 25px rgba(212, 175, 55, 0.25)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'pulse-subtle': 'pulseSubtle 3s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
