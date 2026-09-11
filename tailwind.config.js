/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'] },
      colors: { ink: '#07111f', panel: '#0b1728', line: '#1e334b' },
      boxShadow: { glow: '0 0 50px rgba(34, 211, 238, .12)' }
    }
  },
  plugins: []
}
