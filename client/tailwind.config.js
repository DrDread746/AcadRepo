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
        background: '#F1F5F9',
        surface: '#FFFFFF',
        primary: '#2563EB',
        'primary-hover': '#1D4ED8',
        text: '#1E293B',
        muted: '#64748B',
        border: '#CBD5E1',
      }
    },
  },
  plugins: [],
}
