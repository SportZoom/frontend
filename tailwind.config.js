/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
    "./src/app/**/*.html",          // asegura que capture los standalone
    "./src/app/**/*.ts",
    "./src/app/pages/**/*.html",    // <- añade esta línea si tu carpeta se llama "pages"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
