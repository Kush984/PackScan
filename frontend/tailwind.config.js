/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core Palette Tokens
        canvas: {
          DEFAULT: '#faf7f2', // Warm muted stone/ivory paper canvas
          subtle: '#f4efe6',
          muted: '#ede6d8',
          border: '#e8e2d8',
        },
        card: {
          DEFAULT: '#ffffff',
          hover: '#fdfcfb',
          border: '#e8e2d8',
          borderHover: '#d8cfc0',
        },
        // Primary: Deep Terracotta / Burnt Sienna
        terracotta: {
          50: '#fdf6f2',
          100: '#fbf2ed',
          200: '#f6dfd5',
          300: '#ecc2b0',
          400: '#df9e84',
          500: '#d07b5a',
          600: '#b8532f', // Primary Accent
          700: '#a34a2b', // Hover State
          800: '#863b22', // Active / Pressed
          900: '#6f331f',
          950: '#3c180d',
        },
        // Secondary: Warm Ochre / Mustard Gold
        ochre: {
          50: '#fdfbf5',
          100: '#fbf5e6',
          200: '#f5e8c7',
          300: '#eed69e',
          400: '#dfba63',
          500: '#c99a3e', // Secondary Accent
          600: '#b1812f',
          700: '#926325',
          800: '#795025',
          900: '#654222',
        },
        // Alert / Warning Only: Deeper Rose-Red
        roseAlert: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c', // Violation & Strict Alert
          800: '#9f1239',
          900: '#881337',
        },
        // Text / Typography: Near-black warm charcoal
        charcoal: {
          900: '#2a2622', // Primary Body & Titles
          700: '#5c554e', // Secondary / Body
          500: '#8c8278', // Muted / Labels
          400: '#b0a79d', // Placeholder
          200: '#ded7ce', // Hairlines
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        spaceGrotesk: ['"Space Grotesk"', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
