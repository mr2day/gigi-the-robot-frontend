import type { Config } from 'tailwindcss';
import typography from '@tailwindcss/typography';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      typography: ({ theme }) => ({
        invert: {
          css: {
            color: theme('colors.gray.100'),
            a: { color: theme('colors.white') },
            strong: { color: theme('colors.white') },
            code: {
              backgroundColor: theme('colors.gray.800'),
              color: theme('colors.white'),
              padding: '2px 4px',
              borderRadius: '0.25rem',
            },
            'h1,h2,h3,h4': { color: theme('colors.white') },
            th: { color: theme('colors.white') },
            td: { color: theme('colors.gray.200') },
            blockquote: {
              borderLeftColor: theme('colors.gray.600'),
              color: theme('colors.gray.100'),
            },
          },
        },
      }),
    },
  },
  plugins: [typography],
};

export default config;
