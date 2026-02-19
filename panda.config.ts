import { defineConfig } from "@pandacss/dev";

export default defineConfig({
  // Whether to use css reset
  preflight: true,

  // Where to look for your css declarations
  include: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./pages/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],

  // Files to exclude
  exclude: [],

  // Useful for theme customization
  theme: {
    extend: {
      tokens: {
        colors: {
          brand: {
            orange: { value: "rgba(251, 176, 59, 1)" },
            orangeDark: { value: "rgba(225, 126, 59, 1)" },
            orange2: { value: "#ed7e0e" },
            grey: { value: "#444" },
          },
        },
      },
      breakpoints: {
        phone: "640px",
        tablet: "768px",
        desktop: "1024px",
      },
    },
  },

  // The output directory for your css system
  outdir: "styled-system",
});
