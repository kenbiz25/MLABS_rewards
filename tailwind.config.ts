import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        indigo: {
          DEFAULT: "#2514BE",
          hover: "#1F10A0",
          active: "#190D85",
        },
        periwinkle: "#6165DE",
        lavender: "#BCB5F7",
        "pale-indigo": "#EFEDFF",
        coral: "#EB956A",
        "burnt-orange": "#C35721",
        peach: "#FFBB98",
        green: {
          DEFAULT: "#54CC90",
          deep: "#00A372",
        },
        mint: "#99EFC4",
        "deep-red": "#751A1A",
        "soft-red": "#E98B8B",
        offwhite: "#FCFBF9",
        ink: {
          DEFAULT: "#1A1A1A",
          soft: "#2A2826",
          body: "#505050",
          muted: "#555555",
          faint: "#70706E",
          ghost: "#909090",
        },
        border: {
          DEFAULT: "#DEDDD8",
          strong: "#CFCEC8",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
      maxWidth: {
        page: "1440px",
        dashboard: "1320px",
      },
      borderRadius: {
        card: "24px",
        input: "12px",
        img: "20px",
      },
      transitionTimingFunction: {
        brand: "cubic-bezier(0.2,0,0.2,1)",
      },
      boxShadow: {
        card: "0 2px 10px rgba(37,20,190,0.04)",
        "card-lg": "0 4px 20px rgba(37,20,190,0.05)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0) rotate(var(--rot, 0deg))" },
          "50%": { transform: "translateY(-10px) rotate(var(--rot, 0deg))" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
