/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        morandi: {
          lavender: '#C8B4D8',
          rose: '#D4B8C4',
          blush: '#E0C0C4',
          sage: '#9AACAA',
          mint: '#A8C8B8',
          powder: '#B8CED4',
          amber: '#E8C97E',
          steel: '#7DAFC8',
          dusty: '#C97EA0',
          terra: '#D4937A',
        },
      },
    },
  },
  plugins: [],
}
