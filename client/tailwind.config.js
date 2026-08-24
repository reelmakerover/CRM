/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { 50:'#f0f4fa', 100:'#d9e2f3', 200:'#bfdbfe', 300:'#93c5fd', 400:'#60a5fa', 500:'#1e50d8', 600:'#163fae', 700:'#0b193c', 800:'#0b193c', 900:'#070c1b' },
        accent: { 400:'#f97316', 500:'#ea580c', 600:'#d9531e', 700:'#c24513' },
        navy: { 50:'#f0f4fa', 100:'#d9e2f3', 500:'#162e63', 800:'#0b193c', 900:'#070c1b' },
        gold: { 50:'#fffbeb', 100:'#fef3c7', 200:'#fde68a', 300:'#fcd34d', 400:'#fbbf24', 500:'#f59e0b', 600:'#d97706', 700:'#b45309', 800:'#92400e', 900:'#78350f' },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'slide-up': 'slideUp 0.6s ease-out',
        'fade-in': 'fadeIn 0.8s ease-out',
        'count-up': 'countUp 2s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: { '0%,100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-20px)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(30px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #070c1b 0%, #0b193c 60%, #162e63 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        'gold-gradient': 'linear-gradient(135deg, #f59e0b, #d97706)',
        'blue-gradient': 'linear-gradient(135deg, #0b193c, #162e63)',
        'orange-gradient': 'linear-gradient(135deg, #d9531e, #ea580c)',
        'shimmer-gradient': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.1)',
        'card': '0 4px 24px rgba(30,64,175,0.08)',
        'card-hover': '0 12px 40px rgba(30,64,175,0.18)',
        'glow': '0 0 30px rgba(59,130,246,0.3)',
      },
    },
  },
  plugins: [],
};
