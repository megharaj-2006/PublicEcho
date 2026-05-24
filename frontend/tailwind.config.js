/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0B0F19',       // Deep sleek space dark background
          card: '#161D30',       // Dark glassmorphism card backing
          border: '#242F4D',     // Cool metallic slate borders
          primary: '#3B82F6',    // Electric digital blue
          secondary: '#6366F1',  // Cyber Indigo
          accent: '#10B981',     // Emerald resolution green
          warning: '#F59E0B',    // Golden amber warning
          danger: '#EF4444',     // Crimson danger
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
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
