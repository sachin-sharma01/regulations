/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#f0f4f8',
        surface: '#ffffff',
        border: '#e2e8f0',
        accent: {
          DEFAULT: '#2563eb',
          subtle: '#eff6ff',
        },
        navy: {
          DEFAULT: '#0f172a',
          800: '#1e293b',
          700: '#334155',
        },
      },
      fontFamily: {
        sans: ['"Inter"', '"Segoe UI"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"Cascadia Code"', '"Consolas"', '"Monaco"', 'monospace'],
      },
    },
  },
  plugins: [],
}
