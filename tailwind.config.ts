import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "rgb(var(--brand-bg) / <alpha-value>)",
          fg: "rgb(var(--brand-fg) / <alpha-value>)",
          primary: "rgb(var(--brand-primary) / <alpha-value>)",
          secondary: "rgb(var(--brand-secondary) / <alpha-value>)",
          accent: "rgb(var(--brand-accent) / <alpha-value>)",
          muted: "rgb(var(--brand-muted) / <alpha-value>)",
          card: "rgb(var(--brand-card) / <alpha-value>)",
          border: "rgb(var(--brand-border) / <alpha-value>)",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
