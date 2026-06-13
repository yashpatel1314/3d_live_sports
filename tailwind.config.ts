import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        court: '#C68B2A',
        rim: '#FF6B00',
        nba: '#1D428A',
      },
      keyframes: {
        'bounce-in': {
          '0%': { transform: 'translateY(-100px)', opacity: '0' },
          '60%': { transform: 'translateY(8px)', opacity: '1' },
          '80%': { transform: 'translateY(-4px)' },
          '100%': { transform: 'translateY(0)' },
        },
        'score-flash': {
          '0%, 100%': { backgroundColor: 'transparent' },
          '50%': { backgroundColor: 'rgba(255,140,0,0.3)' },
        },
        'number-roll': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(255,107,0,0)' },
          '50%': { boxShadow: '0 0 20px 6px rgba(255,107,0,0.6)' },
        },
      },
      animation: {
        'bounce-in': 'bounce-in 0.6s ease-out',
        'score-flash': 'score-flash 0.8s ease-in-out',
        'number-roll': 'number-roll 0.4s ease-out',
        'pulse-glow': 'pulse-glow 1s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

export default config
