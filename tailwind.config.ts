import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ink: '#05070a',
        'ink-2': '#0a0e12',
        bone: '#dfe7e0',
        'bone-dim': '#aab4ad',
        muted: '#78837c',
        vermilion: '#e0231c',
        ember: '#ff5a3c',
        gold: '#c9a24a',
      },
      fontFamily: {
        sans: ['Onest', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
