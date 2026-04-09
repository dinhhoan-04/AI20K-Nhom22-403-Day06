/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        vf: {
          bg: '#0A0D11', // Deep background representing the very back
          panel: '#12151B', // Panel background
          card: '#1A1D24', // Card background 
          blue: '#1A4CCC', // Core Blue
          cyan: '#00D2FF', // Accent cyan
          red: '#F05252',
          yellow: '#E3A008',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
