import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand palette (spec)
        brand: {
          50: "#f0f9f2",
          100: "#dcf0e1",
          200: "#bce0c6",
          300: "#8ec9a3",
          400: "#5ba87a",
          500: "#3d8b5c",
          600: "#2d6e47",
          700: "#26593b",
          800: "#21472f",
          900: "#1c3a28",
        },
        earth: {
          50: "#faf6f1",
          100: "#f0e6d6",
          200: "#dfcaa8",
          300: "#caa97a",
          400: "#b78b56",
          500: "#a07440",
          600: "#7d5a32",
          700: "#5c4326",
          800: "#3f2e1c",
          900: "#291e13",
        },
        alert: {
          high: "#c2410c",
          medium: "#d97706",
          low: "#65a30d",
        },
        // shadcn/ui CSS-variable-backed semantic colours
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};

export default config;
