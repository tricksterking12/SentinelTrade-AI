/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'sentinel-emerald': '#10b981',
        'sentinel-obsidian': '#0a0a0a',
        'admin-cobalt': '#3b82f6',
        'admin-carbon': '#0f172a',
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
