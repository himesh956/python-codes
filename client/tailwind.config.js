/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Primary — warm terracotta, replaces generic blue
        brand: {
          50: "#fef4ed",
          100: "#fce3d0",
          200: "#f8c5a0",
          300: "#f3a06a",
          400: "#ec7a3d",
          500: "#dd5f23", // primary action color
          600: "#bd4a1a",
          700: "#993a17",
          800: "#7a2f18",
          900: "#642817",
        },
        // Secondary — deep teal, used for trust/verification signals
        trust: {
          50: "#eefbfa",
          100: "#d4f3f0",
          200: "#ade6e1",
          300: "#78d1ca",
          400: "#43b3ab",
          500: "#279690", // verification badges, trust score
          600: "#1c7874",
          700: "#1a605e",
          800: "#194d4c",
          900: "#194141",
        },
        // Warm neutrals (not cold slate)
        ink: {
          50: "#f9f7f5",
          100: "#f1ede9",
          200: "#e3dcd4",
          300: "#cec2b5",
          400: "#a8968a",
          500: "#83716a",
          600: "#665854",
          700: "#524744",
          800: "#3a322f",
          900: "#241f1d",
        },
        // Status colors — availability system
        available: "#22a559", // available now
        soon: "#e6a531", // available today
        busy: "#8a8078", // busy/offline
        danger: "#d64545",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["'Sora'", "Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(36,31,29,0.04), 0 4px 12px rgba(36,31,29,0.06)",
        "card-hover": "0 2px 4px rgba(36,31,29,0.06), 0 8px 24px rgba(36,31,29,0.10)",
      },
      spacing: {
        18: "4.5rem",
      },
    },
  },
  plugins: [],
};