/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '1rem',
    },
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },
    extend: {
      fontFamily: {
        manrope: ['var(--font-manrope)', 'sans-serif'],
      },
      colors: {
        primary: '#ff0042',
        secondary: '#ffcd00', // Added secondary from common Tailstore usage
        gray: {
          lighter: '#FAF7F3',
          light: '#323232',
          dark: '#010717',
          txt: '#4c4d56',
          line: '#E5E5E5',
        },
      },
    },
  },
  plugins: [],
}
