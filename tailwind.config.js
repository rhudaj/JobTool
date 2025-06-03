// filepath: tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bggrey: 'rgb(123, 131, 138)',
      },
    },
  },
  plugins: [],
}