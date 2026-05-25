/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#080809',       // Deep space dark background
          card: '#0c0c0e',       // Charcoal card backing
          border: '#1f1f23',     // Razor-sharp dark border
          primary: '#2563EB',    // Professional Blue
          accent: '#14B8A6',     // Civic Teal
          warning: '#F97316',    // Pending Orange
          danger: '#EF4444',     // Rejected Red
          success: '#10B981',    // Resolved Green
          lightBg: '#F8FAFC',    // Light mode background
          darkText: '#111827',   // Dark mode text
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Urbanist', 'sans-serif'],
      },
      boxShadow: {
        'neon': '0 0 15px rgba(59, 130, 246, 0.4)',
        'neon-green': '0 0 15px rgba(16, 185, 129, 0.4)',
        'neon-amber': '0 0 15px rgba(245, 158, 11, 0.4)',
      }
    },
  },
  plugins: [],
}
