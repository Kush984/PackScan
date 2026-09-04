/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "teal-primary": "#47d1cc",
        "teal-dark": "#0d9488",
        "teal-light": "#f0fdfc",
        "teal-border": "#ccfbf1",
        "turquoise-accent": "#47d1cc",
        "turquoise-hover": "#38c2bd",
        "turquoise-dark": "#0d9488",
        "turquoise-deep": "#042f2e",
        "canvas-bg": "#f0fdfc",
        "canvas-subtle": "#eefcfb",
        "alert-coral": "#ea580c",
        "alert-coral-bg": "#fff7ed",
        "alert-coral-border": "#fed7aa",
        primary: {
          50: '#f0fdfc',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#47d1cc', // Vivid turquoise accent #47d1cc
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
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
