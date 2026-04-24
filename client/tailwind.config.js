/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        background: '#fff1f2',
        surface: '#ffe4e6',
        primary: '#e11d48',
        'primary-hover': '#be123c',
      }
    },
  },
  plugins: [],
}
