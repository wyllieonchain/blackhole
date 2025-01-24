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
        sans: ['Lexend Giga', 'sans-serif'],
        golos: ['Golos Text', 'serif'],
      },
    },
  },
  plugins: [],
} 