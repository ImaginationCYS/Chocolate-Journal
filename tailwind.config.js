/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cocoa: {
          50:  '#FDF8F2',
          100: '#F5EBE0',
          200: '#E8D5C0',
          300: '#D4B896',
          400: '#C49B6C',
          500: '#B8844E',
          600: '#9E6D3C',
          700: '#7D5530',
          800: '#5E3F24',
          900: '#3E2816',
          950: '#2D1909',
        },
        noir: {
          50:  '#F5F3F1',
          100: '#E7E3DF',
          200: '#D1CAC3',
          300: '#B0A69D',
          400: '#8F8277',
          500: '#75695F',
          600: '#5E544C',
          700: '#4A413B',
          800: '#342D28',
          900: '#1F1A17',
          950: '#0D0807',
        },
        gold: {
          50:  '#FFFDF7',
          100: '#FEF9E7',
          200: '#FDF0C4',
          300: '#FBE28E',
          400: '#F8D05B',
          500: '#E8B93A',
          600: '#C8972A',
          700: '#9E7425',
          800: '#7D5A22',
          900: '#5E421E',
          950: '#342410',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', '"Noto Serif SC"', 'Georgia', 'serif'],
        serif: ['"Noto Serif SC"', '"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Inter"', '"Noto Serif SC"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'shimmer': 'shimmer 2s infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
}
