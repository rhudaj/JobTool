/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
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