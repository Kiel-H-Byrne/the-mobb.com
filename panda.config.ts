import { defineConfig } from "@pandacss/dev";

export default defineConfig({
  globalCss: {
    body: {
      bg: "bg.canvas",
      color: "text.main",
      transition: "background-color 0.3s, color 0.3s",
    }
  },
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
            orange: { value: "#FF5A00" }, // 2030 Neon Orange
            orangeDark: { value: "#D94A00" },
            orangeLight: { value: "#FF8A00" }, // Glow orange
            orangeMuted: { value: "rgba(255, 90, 0, 0.2)" },
            black: { value: "#0B0B0E" }, // 2030 Deep Space Black
            grey: { value: "#2D2D35" }, // 2030 Metallic Grey
            greyDark: { value: "#15151A" }, // Panel bg
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
          glass: { value: "0 30px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)" }, // 2030 Glassmorphic shadow
          glow: { value: "0 0 20px rgba(255, 90, 0, 0.3)" },
          glowStrong: { value: "0 0 30px rgba(255, 90, 0, 0.6)" },
        },
        fonts: {
          heading: { value: "'Space Grotesk', 'Outfit', 'Inter', sans-serif" },
          body: { value: "'Inter', sans-serif" },
          tech: { value: "'Space Grotesk', sans-serif" },
        },
        animations: {
          radarSpin: { value: 'radar 4s linear infinite' },
          pulseSlow: { value: 'pulseStrong 3s cubic-bezier(0.4, 0, 0.6, 1) infinite' },
          floatAnim: { value: 'float 6s ease-in-out infinite' },
          glowPulse: { value: 'glowPulse 2s alternate infinite' }
        }
      },
      keyframes: {
        radar: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        glowPulse: {
          '0%': { boxShadow: '0 0 10px rgba(255, 90, 0, 0.2)' },
          '100%': { boxShadow: '0 0 30px rgba(255, 90, 0, 0.6)' }
        },
        pulseStrong: {
          '0%': { transform: 'scale(0.5)', opacity: '1' },
          '100%': { transform: 'scale(2)', opacity: '0' }
        }
      },
      semanticTokens: {
        colors: {
          bg: {
            canvas: { value: { base: "#FFFFFF", _dark: "{colors.brand.black}" } },
            surface: { value: { base: "#F3F4F6", _dark: "{colors.brand.greyDark}" } },
            glass: {
              value: {
                base: "linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.70) 100%)",
                _dark: "linear-gradient(135deg, rgba(21, 21, 26, 0.85) 0%, rgba(21, 21, 26, 0.70) 100%)"
              }
            },
          },
          text: {
            main: { value: { base: "{colors.brand.black}", _dark: "{colors.brand.white}" } },
            muted: { value: { base: "#6B7280", _dark: "{colors.brand.greyLight}" } }, // Safe fallback for greyLight
          },
          border: {
            light: { value: { base: "rgba(0, 0, 0, 0.08)", _dark: "rgba(255, 255, 255, 0.08)" } },
            neon: { value: "{colors.brand.orangeMuted}" }
          },
        },
      },
    },
  },
  outdir: "styled-system",
});
