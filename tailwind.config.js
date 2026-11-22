/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito Variable', 'Nunito', 'system-ui', 'sans-serif'],
        heading: ['Nunito Variable', 'Nunito', 'system-ui', 'sans-serif'],
      },
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        ink: 'var(--text)',
        muted: 'var(--muted)',
        'surface-2': 'var(--surface-2)',
        deep: 'var(--ink)',
        'on-deep': 'var(--on-ink)',
        line: 'var(--border)',
        accent: {
          DEFAULT: 'var(--accent)',
          soft: 'var(--accent-soft)',
          on: 'var(--on-accent)',
        },
        tea: {
          50: '#fff1f4',
          100: '#ffe0e7',
          200: '#ffc2d0',
          300: '#ff93ab',
          400: '#f95a80',
          500: '#ee2a59',
          600: '#D8073C',
          700: '#b30531',
          800: '#8f0728',
          900: '#6b061f',
        },
        chai: {
          50: '#fef9f0',
          100: '#feefce',
          200: '#fcd99c',
          300: '#f9bc5f',
          400: '#f6a030',
          500: '#e98320',
          600: '#cc6616',
          700: '#a94b15',
          800: '#893c18',
          900: '#703318',
        },
      },
      animation: {
        'steam-1': 'steam 2s ease-in-out infinite',
        'steam-2': 'steam 2s ease-in-out infinite 0.4s',
        'steam-3': 'steam 2s ease-in-out infinite 0.8s',
        'pulse-soft': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      keyframes: {
        steam: {
          '0%': { opacity: '0', transform: 'translateY(0) scaleX(1)' },
          '50%': { opacity: '0.7', transform: 'translateY(-12px) scaleX(1.2)' },
          '100%': { opacity: '0', transform: 'translateY(-24px) scaleX(0.8)' },
        },
      },
    },
  },
  plugins: [],
};

