import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        orange: {
          50: '#FFF8F5',
          100: '#FFE8D6',
          200: '#FFD4B3',
          300: '#FFB380',
          400: '#FF8C69',
          500: '#FF6B4A',
          600: '#FF8C42',
          700: '#FF7F33',
        },
        coral: {
          50: '#FFF5F5',
          100: '#FFE5E5',
          400: '#FF7F7F',
          500: '#FF6B6B',
        },
      },
      borderWidth: {
        '3': '3px',
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
