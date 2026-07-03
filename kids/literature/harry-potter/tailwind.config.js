/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        magic: ['"Cinzel Decorative"', 'serif'],
        heading: ['Cinzel', 'serif'],
        body: ['Nunito', 'sans-serif'],
      },
      colors: {
        night: {
          900: '#0b0c22',
          800: '#151538',
          700: '#1f1d4d',
        },
        gold: {
          DEFAULT: '#e6c25a',
          bright: '#ffd97a',
          dim: '#a8893a',
        },
      },
    }
  },
  plugins: []
}
