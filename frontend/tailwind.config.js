/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981', // Emerald Green accent
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        dark: {
          50: '#f9fafb',
          100: '#f3f4f6',
          800: '#1e1e1f', // Zinc grey
          900: '#09090b', // Deep blackish grey
          950: '#000000', // Pure Black
        },
        glass: {
          border: 'rgba(255, 255, 255, 0.08)',
          bg: 'rgba(10, 10, 10, 0.55)', // Transparent black
          hover: 'rgba(255, 255, 255, 0.04)',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glass-sm': '0 2px 8px 0 rgba(0, 0, 0, 0.4)',
        'glass-md': '0 8px 32px 0 rgba(0, 0, 0, 0.6)',
        'glass-brand': '0 0 15px 1px rgba(16, 185, 129, 0.12)', // Subtle green glow
      },
      backgroundImage: {
        'radial-gradient': 'radial-gradient(circle at top right, var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [],
}
