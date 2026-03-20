/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: '#0a0a0b',
        bg2: '#111113',
        surface: '#18181c',
        surface2: '#1f1f25',
        border1: 'rgba(255,255,255,0.07)',
        border2: 'rgba(255,255,255,0.12)',
        textMain: '#f2f2f4',
        muted: '#6b6b78',
        muted2: '#9898a8',
        accent: '#e2ff5d',
        accent2: '#c8e84e',
        accentFg: '#0a0a0b',
        danger: '#ff4d4d',
        success: '#4dffb4',
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
      animation: {
        bgFade: 'bgFade 1.8s 0.4s ease forwards',
        slideDown: 'slideDown 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
        iconFloat: 'iconFloat 4s ease-in-out infinite',
        riseIn: 'riseIn 0.45s cubic-bezier(0.22, 1, 0.36, 1) both 0.1s',
        rowIn: 'rowIn 0.3s ease-out both',
        spin: 'spin 0.9s linear infinite',
        toastIn: 'toastIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        fadeIn: 'fadeIn 0.2s ease both',
        modalIn: 'modalIn 0.3s cubic-bezier(0.22, 1, 0.36, 1) both',
      },
      keyframes: {
        bgFade: { to: { opacity: '1' } },
        slideDown: {
          from: { transform: 'translateY(-100%)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' }
        },
        iconFloat: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-3px)' }
        },
        riseIn: {
          from: { transform: 'translateY(14px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' }
        },
        rowIn: {
          from: { transform: 'translateY(8px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' }
        },
        toastIn: {
          from: { transform: 'translateY(-8px) scale(0.97)', opacity: '0' },
          to: { transform: 'translateY(0) scale(1)', opacity: '1' }
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' }
        },
        modalIn: {
          from: { transform: 'translateY(20px) scale(0.97)', opacity: '0' },
          to: { transform: 'translateY(0) scale(1)', opacity: '1' }
        }
      }
    },
  },
  plugins: [],
}