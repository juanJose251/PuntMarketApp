/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-navy': '#001f3f',
        'dark-card': '#082032',
        'dark-table-header': '#061826',
        'dark-row-hover': '#114e78',
        'dark-row-alt': '#0a2642',
        'blue-primary': '#007bff',
        'blue-hover': '#0056b3',
        'emerald-primary': '#10b981',
        'emerald-hover': '#059669',
      },
      fontFamily: {
        sans: ['Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
