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
  plugins: (() => {
    const list = [];
    try {
      // optional plugins - if not installed, don't break the build
      list.push(require('@tailwindcss/aspect-ratio'));
    } catch (e) {
      // plugin missing - skip
    }
    try {
      list.push(require('@tailwindcss/forms'));
    } catch (e) {
      // plugin missing - skip
    }
    return list;
  })(),
}
