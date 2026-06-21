import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        surface: {
          0: "#080B10",
          1: "#0D1117",
          2: "#161B22",
          3: "#1C2230",
          4: "#222A38",
        },
        border: {
          subtle: "#21262D",
          DEFAULT: "#30363D",
          strong: "#3D4450",
        },
        accent: {
          cyan: "#00D4FF",
          green: "#00E676",
          red: "#FF3D57",
          amber: "#FFB020",
          purple: "#9B59F6",
        },
        text: {
          primary: "#E6EDF3",
          secondary: "#8B949E",
          muted: "#484F58",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "Fira Code", "monospace"],
      },
      fontSize: {
        "2xs": ["10px", "14px"],
        xs: ["11px", "16px"],
        sm: ["12px", "18px"],
        base: ["13px", "20px"],
        md: ["14px", "22px"],
        lg: ["16px", "24px"],
        xl: ["18px", "28px"],
        "2xl": ["20px", "30px"],
        "3xl": ["24px", "32px"],
      },
      boxShadow: {
        card: "0 0 0 1px #21262D, 0 2px 8px rgba(0,0,0,0.4)",
        "card-hover": "0 0 0 1px #30363D, 0 4px 16px rgba(0,0,0,0.5)",
        glow: "0 0 12px rgba(0,212,255,0.15)",
        "glow-green": "0 0 12px rgba(0,230,118,0.15)",
        "glow-red": "0 0 12px rgba(255,61,87,0.15)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4,0,0.6,1) infinite",
        "fade-in": "fadeIn 0.2s ease-out",
        "slide-in": "slideIn 0.3s ease-out",
        "count-up": "countUp 0.6s ease-out",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0", transform: "translateY(-4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          from: { opacity: "0", transform: "translateX(-8px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        countUp: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "grid-pattern":
          "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: "24px 24px",
      },
    },
  },
  plugins: [],
};

export default config;
