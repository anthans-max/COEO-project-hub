import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-dm-sans)", "sans-serif"],
      },
      colors: {
        primary: "#0A2342",
        accent: "#F4821F",
        cream: "#F5F0E8",
        border: "#E8E2D9",
        "border-light": "#F0EAE0",
        "text-primary": "#1A1612",
        "text-secondary": "#8A7E6E",
        "text-muted": "#A09880",
        destructive: "#C0392B",
        // Badge variants
        "badge-blue-bg": "#E6EFF7",
        "badge-blue-text": "#0A2342",
        "badge-amber-bg": "#FEF3E7",
        "badge-amber-text": "#924D0A",
        "badge-green-bg": "#E8F4ED",
        "badge-green-text": "#1A5C32",
        "badge-gray-bg": "#F1EDE6",
        "badge-gray-text": "#6B5E50",
        "badge-red-bg": "#FDECEA",
        "badge-red-text": "#8B1F18",
      },
      borderRadius: {
        card: "10px",
        pill: "20px",
      },
      width: {
        sidebar: "224px",
      },
      minWidth: {
        sidebar: "224px",
      },
    },
  },
  plugins: [],
};
export default config;
