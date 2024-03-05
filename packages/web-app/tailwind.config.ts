import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'background-pattern': 'url("/background-pattern.png")',
        'background-pattern-overlay': 'url("/background-pattern-overlay.svg")',
      },
      fontSize: {
        '5.5xl': ['3.25rem', '3.75rem'],
      },
      lineHeight: {
        '14': '3.5rem',
        '18': '4.5rem',
      },
      colors: {
        white: '#FFF',
        'blue-light': '#8CA5F9',
        blue: '#3F69F5',
        'blue-dark': '#0D42F2',
        'grey-lightest': '#F3F5F9',
        'grey-light': '#DADFED',
        grey: '#92A0B9',
        'grey-dark': '#354257',
        'grey-gradient-start': '#455069',
        'grey-gradient-end': '#3A4B70',
        'font-color': '#354257',
        'font-color-light': '#727D8E',
      },
      spacing: {
        '17': '4.25rem',
        '27': '6.75rem',
        '31': '7.75rem',
      },
      boxShadow: {
        'shadow-button': '0px 0px 8px 0px rgba(53, 66, 87, 0.80)',
      },
    },
    keyframes: {
      shimmer: {
        '100%': {
          transform: 'translateX(100%)',
        },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
export default config;
