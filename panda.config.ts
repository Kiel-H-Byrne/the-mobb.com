import { defineConfig } from "@pandacss/dev";

export default defineConfig({
  preflight: true,
  jsxFramework: 'react', // Enable JSX generation for Ark UI components
  include: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./pages/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  exclude: [],
  theme: {
    extend: {
      tokens: {
        colors: {
          brand: {
            orange: { value: "#F28F1D" }, // A warmer, more natural orange
            orangeDark: { value: "#D97914" },
            orangeLight: { value: "#FDEBCE" },
            black: { value: "#1A1A1A" },
            grey: { value: "#F5F5F5" },
            greyDark: { value: "#4A4A4A" },
            white: { value: "#FFFFFF" },
          },
        },
        radii: {
          sm: { value: "4px" },
          md: { value: "8px" },
          lg: { value: "12px" },
          xl: { value: "16px" },
          "2xl": { value: "24px" },
          full: { value: "9999px" },
        },
        shadows: {
          sm: { value: "0 1px 2px 0 rgba(0, 0, 0, 0.05)" },
          md: { value: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)" },
          lg: { value: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" },
          glass: { value: "0 8px 32px 0 rgba(31, 38, 135, 0.15)" }, // Glassmorphic shadow
        },
        fonts: {
          heading: { value: "'Outfit', 'Inter', sans-serif" },
          body: { value: "'Inter', sans-serif" },
        },
      },
      semanticTokens: {
        colors: {
          bg: {
            canvas: { value: "{colors.brand.grey}" },
            surface: { value: "{colors.brand.white}" },
            glass: { value: "rgba(255, 255, 255, 0.85)" }, // Soft translucent white
          },
          text: {
            main: { value: "{colors.brand.black}" },
            muted: { value: "{colors.brand.greyDark}" },
          },
          border: {
            light: { value: "rgba(0, 0, 0, 0.08)" },
          },
        },
      },
    },
  },
  outdir: "styled-system",
});
