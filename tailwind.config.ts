import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/frontend/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        qadam: {
          bg: "#F8FAF7",
          card: "#FFFFFF",
          primary: "#0F766E",
          primaryDark: "#0B5F58",
          blue: "#2563EB",
          yellow: "#F2C94C",
          graphite: "#1F2933",
          muted: "#64748B",
          border: "#DDE7E1"
        }
      },
      boxShadow: {
        soft: "0 10px 28px rgba(15, 118, 110, 0.08)"
      }
    }
  },
  plugins: []
} satisfies Config;
