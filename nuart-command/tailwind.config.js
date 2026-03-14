/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nuart: {
          dark: "#0f2a4a",
          blue: "#1a4270",
          snp: "#8b5cf6",
          pessoas: "#0ea5e9",
          patrimonio: "#10b981",
          locus: "#f59e0b",
        }
      },
      backgroundImage: {
        'nuart-gradient': 'linear-gradient(135deg, #0f2a4a 0%, #1a4270 100%)',
      }
    },
  },
  plugins: [],
}
