/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  
  theme: {
    extend: {
      colors: {
        // Porsche Design (oscuro sobrio)
        pd_bg: "#0b0b0b",       // antracita casi negro
        pd_panel: "#111111",    // paneles
        pd_line: "#1a1a1a",     // líneas sutiles
        pd_text: "#e6e6e6",     // texto principal
        pd_muted: "#a8a8a8",    // texto secundario
        pd_gold: "#c4a15a",     // acento dorado mate
      },
      fontFamily: {
        playfair: ["'Playfair Display'", "serif"],
        inter: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 4px 24px rgba(0,0,0,0.25)",
      },
    },
  },
  plugins: [],
};

