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
        midnight: {
          50: '#e6f4f4',
          100: '#b3dede',
          200: '#80c8c9',
          300: '#4db2b3',
          400: '#1a9c9d',
          500: '#023436', // Midnight Green (Primary/Dominant)
          600: '#022c2e',
          700: '#022425',
          800: '#011e1f',
          900: '#011718', // Deep background
          950: '#010f10',
        },
        pine: {
          50: '#e6f8f7',
          100: '#b3eeeb',
          200: '#80e3df',
          300: '#4dd9d3',
          400: '#1acec7',
          500: '#03B5AA', // Pine Green (Secondary/Interactive)
          600: '#02968d',
          700: '#02766f',
          800: '#015651',
          900: '#013734',
          950: '#012422',
        },
        coral: {
          50: '#fff3ee',
          100: '#ffdcd0',
          200: '#ffc4b1',
          300: '#ffad93',
          400: '#ff9674',
          500: '#FF8552', // Coral (Accent/CTA)
          600: '#e66835',
          700: '#bf4a1a',
          800: '#992d04',
          900: '#731a00',
          950: '#4a1100',
        },
        brand: {
          50: '#e6f8f7',
          100: '#b3eeeb',
          200: '#80e3df',
          300: '#4dd9d3',
          400: '#1acec7',
          450: '#0ec2b7',
          500: '#03B5AA', // Pine Green mapping
          600: '#02968d',
          650: '#02867e',
          700: '#02766f',
          800: '#015651',
          900: '#023436', // Midnight Green
          950: '#011718',
        },
        dark: {
          50: '#f9fafb',
          100: '#f3f4f6',
          800: '#023436', // Midnight Green surface
          900: '#022425', // Midnight Dark card
          950: '#011718', // Midnight Deep background
        },
        glass: {
          border: 'rgba(3, 181, 170, 0.18)',
          bg: 'rgba(2, 36, 37, 0.85)',
          hover: 'rgba(3, 181, 170, 0.08)',
        }
      },
      fontFamily: {
        sans: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glass-sm': '0 2px 6px 0 rgba(0, 0, 0, 0.3)',
        'glass-md': '0 4px 16px 0 rgba(0, 0, 0, 0.4)',
        'glass-brand': 'none',
        'glass-pine': 'none',
        'glass-coral': 'none',
        'glass-midnight': 'none',
      },
      backgroundImage: {
        'radial-gradient': 'radial-gradient(circle at top right, var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [],
}
