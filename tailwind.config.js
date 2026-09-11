/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f4ff',
          100: '#e0e9fe',
          200: '#c3d6fd',
          300: '#96b9fc',
          400: '#6392f8',
          500: '#3b6ef4',
          600: '#254edb',
          700: '#1d3cb4',
          800: '#1d3392',
          900: '#1d2c73',
          950: '#111947',
        },
        slate: {
          850: '#151f32',
          950: '#0b1120',
        }
      },
    },
  },
  plugins: [],
};
