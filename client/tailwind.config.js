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
        background: '#ffffff',
        surface: '#f8f9fa',
        primary: '#4a90a4',
        'primary-hover': '#3a7a8e',
      }
    },
  },
  plugins: [],
}
