import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        gotera: {
          earth: "var(--gotera-earth)",
          gold: "var(--gotera-gold)",
          green: "var(--gotera-green)",
          cream: "var(--gotera-cream)",
          red: "var(--gotera-red)",
          bark: "var(--gotera-bark)",
          mist: "var(--gotera-mist)",
          charcoal: "var(--gotera-charcoal)",
          amber: "var(--gotera-amber)",
        },
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-noto-ethiopic)", "var(--font-playfair)", "serif"],
        accent: ["var(--font-playfair)", "Georgia", "serif"],
        mono: ["var(--font-jetbrains)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        warm: "var(--shadow-warm)",
      },
      keyframes: {
        floaty: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
      },
      animation: {
        floaty: "floaty 5.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
