import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/contexts/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        dark: "#0a0a0a",  // 다크 모드 기본 배경
        "neon-pink": "#ff007f", // 네온 핑크
        "neon-pink-hover": "#cc0066",
        "neon-violet": "#a32cc4", // 네온 바이올렛
        "neon-violet-hover": "#8222a3",
      },
    },
  },
  plugins: [],
} satisfies Config;
