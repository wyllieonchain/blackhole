/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      animation: {
        'spin-slow': 'spin linear infinite',
      },
      fontFamily: {
        sans: ['Bebas Neue', 'sans-serif'],
        golos: ['Golos Text', 'serif'],
        lexend: ['Lexend Giga', 'sans-serif'],
      },
    },
  },
  plugins: [],
} 