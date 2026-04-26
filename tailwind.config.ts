import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/frontend/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        qadam: {
          bg: "rgb(var(--color-bg) / <alpha-value>)",
          card: "rgb(var(--color-card) / <alpha-value>)",
          primary: "rgb(var(--color-primary) / <alpha-value>)",
          primaryDark: "rgb(var(--color-primary-dark) / <alpha-value>)",
          blue: "#2563EB",
          yellow: "#F2C94C",
          graphite: "rgb(var(--color-text) / <alpha-value>)",
          muted: "rgb(var(--color-muted) / <alpha-value>)",
          border: "rgb(var(--color-border) / <alpha-value>)"
        }
      },
      boxShadow: {
        soft: "0 10px 28px rgba(15, 118, 110, 0.08)"
      }
    }
  },
  plugins: []
} satisfies Config;
