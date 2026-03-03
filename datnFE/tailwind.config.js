/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#D32F2F',
          hover: '#C62828',
          active: '#B71C1C',
          light: '#FFEBEE',
        },
      },
    },
  },
  plugins: [],
}


