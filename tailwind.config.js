/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        hpe: {
          DEFAULT: '#00B388'
        }
      }
    }
  },
  plugins: []
}
