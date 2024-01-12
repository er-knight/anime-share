/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        fade: 'fade 3s ease-in-out',
      },
      keyframes: {
        fade: {
          '0%': { 
            color: 'rgb(37 99 235)'
          },
          '100%': { 
            color: 'transparent' 
          }
        }
      }
    }
  },
  plugins: [],
}

