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
        background: '#f5f0e8', // Light woody background
        surface: '#e8e0d5', // Woody surface color
        primary: '#8b5a2b', // Wood brown primary
        'primary-hover': '#6d4520', // Darker wood brown for hover
      }
    },
  },
  plugins: [],
}
