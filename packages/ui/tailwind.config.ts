import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,astro}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          teal:      "#0B555C",
          "teal-dark":"#063A40",
          "teal-light":"#C9E8EB",
          gold:      "#8F6734",
          "gold-dark":"#4C381F",
          "gold-light":"#E9CFAE",
          ink:       "#1F2A2E",
          muted:     "#5B6B6E",
          border:    "#D8C893",
          surface:   "#F8F7F4",
        },
        tier: {
          silver:  "#9CA3AF",
          gold:    "#8F6734",
          diamond: "#60A5FA",
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        serif: ["Playfair Display", "Georgia", "serif"],
      },
      borderRadius: {
        brand: "0.5rem",
      },
      boxShadow: {
        brand: "0 2px 16px 0 rgba(11,85,92,0.08)",
        gold:  "0 2px 16px 0 rgba(143,103,52,0.15)",
      },
    },
  },
  plugins: [],
};

export default config;
