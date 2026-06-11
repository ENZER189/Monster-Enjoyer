import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        monster: '#7CFF00',
        ink: '#080A08',
        panel: '#111611'
      }
    }
  },
  plugins: []
};

export default config;
