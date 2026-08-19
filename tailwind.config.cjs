/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './styles/**/*.{js,ts,jsx,tsx,css}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#070708',
        card: '#121216',
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        mono: ['Space Grotesk', 'monospace'],
      },
    },
  },
  plugins: [],
};
