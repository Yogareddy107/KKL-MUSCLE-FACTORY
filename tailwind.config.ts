import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          dark: "#090A0F",
          darker: "#06070A",
          surface: "#11131E",
          elevated: "#181B2B",
          border: "#25283D",
          "border-gold": "rgba(229, 174, 50, 0.28)",
          gold: "#E5AE32",
          "gold-light": "#F6C451",
          "gold-dark": "#B8841B",
          purple: "#1F142E",
          "purple-deep": "#160C22",
          "purple-glow": "rgba(102, 38, 133, 0.18)",
          cream: "#F7F5EE",
          "cream-dim": "#D8D4C8",
          muted: "#9B99A8",
        },
      },
      fontFamily: {
        heading: ["var(--font-heading)", "Oswald", "Bebas Neue", "Impact", "sans-serif"],
        body: ["var(--font-body)", "Inter", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #F6C451 0%, #E5AE32 50%, #B8841B 100%)",
        "gold-shine": "linear-gradient(90deg, #B8841B 0%, #F6C451 50%, #B8841B 100%)",
        "dark-radial": "radial-gradient(circle at 50% 0%, #201333 0%, #090A0F 70%)",
        "card-gradient": "linear-gradient(180deg, rgba(24, 27, 43, 0.8) 0%, rgba(17, 19, 30, 0.95) 100%)",
      },
      boxShadow: {
        "gold-sm": "0 2px 10px rgba(229, 174, 50, 0.2)",
        "gold-md": "0 4px 20px rgba(229, 174, 50, 0.3)",
        "gold-lg": "0 8px 30px rgba(229, 174, 50, 0.4)",
        "purple-glow": "0 0 40px rgba(102, 38, 133, 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
