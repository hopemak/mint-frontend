/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1D4241',
          50: '#E8EFEE',
          100: '#C7DAD8',
          200: '#9FBFBC',
          300: '#75A3A0',
          400: '#4C8884',
          500: '#316966',
          600: '#1D4241',
          700: '#16332F',
          800: '#0F2422',
          900: '#081514',
        },
        accent: {
          DEFAULT: '#EF9C82',
          50: '#FDF4F0',
          100: '#FBE4DA',
          200: '#F6C7B3',
          300: '#F2AB8D',
          400: '#EF9C82',
          500: '#EA7C57',
          600: '#DF5B2B',
        },
        surface: '#F8FAFC',
        ink: '#1A202C',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Poppins', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,24,32,0.06), 0 1px 3px rgba(16,24,32,0.08)',
        soft: '0 4px 16px rgba(29,66,65,0.08)',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
      },
    },
  },
  plugins: [],
}
