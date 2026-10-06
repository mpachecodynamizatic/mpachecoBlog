/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,njk,md}"],
  theme: {
    extend: {
      colors: { primary: "#0f172a", secondary: "#64748b" },
      fontFamily: {
        sans: ['system-ui', 'sans-serif'],
        mono: ['Menlo', 'Courier New', 'monospace'],
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
  darkMode: 'class',
};
