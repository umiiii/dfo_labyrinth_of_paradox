import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        parchment: '#d6c08a',
        gold: '#f3c14b',
        goldDark: '#b88a2c',
        woodDark: '#3a2718',
        woodMid: '#553a23',
      },
      fontFamily: {
        zh: ['"Microsoft YaHei"', 'SimHei', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
