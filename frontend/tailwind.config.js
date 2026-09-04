/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "teal-primary": "#0e7490",
        "teal-dark": "#155e75",
        "teal-light": "#ecfeff",
        "teal-border": "#a5f3fc",
        "canvas-bg": "#f1f5f9",
        "alert-coral": "#ea580c",
        "alert-coral-bg": "#fff7ed",
        "alert-coral-border": "#ffedd5",
        primary: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490', // Reconciled Primary: #0e7490
          800: '#155e75',
          900: '#164e63',
          950: '#083344',
        },
        alert: {
          50: '#fff7ed',
          500: '#f97316',
          600: '#ea580c', // Standardized Alert/Warning: #ea580c
          700: '#c2410c',
        },
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          900: '#064e3b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        spaceGrotesk: ['"Space Grotesk"', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        jetbrainsMono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
