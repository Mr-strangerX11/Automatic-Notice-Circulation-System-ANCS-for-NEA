/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0f766e',
        accent: '#d97706',
        muted: '#1f2937'
      }
    },
  },
  plugins: [],
}
