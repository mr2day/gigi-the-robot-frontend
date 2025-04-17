import type { Config } from 'tailwindcss';
import typography from '@tailwindcss/typography';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      typography: {
        invert: {
          css: {
            color: '#f8faff',
            a: { color: '#8ab4f8' },
            strong: { color: '#f8faff' },
            'h1, h2, h3, h4': { color: '#f8faff' },
            code: {
              color: '#f8faff',
              backgroundColor: '#1e1f22',
              padding: '0.2em 0.4em',
              borderRadius: '0.25rem',
            },
            blockquote: {
              color: '#f8faff',
              borderLeftColor: '#444',
              borderLeftWidth: '2px', // <-- Make border thinner
            },
            hr: { borderColor: '#444', borderTopWidth: '1px' }, // <-- Thinner <hr>
            'ul > li::marker': { color: '#888' },
            'ol > li::marker': { color: '#888' },
          },
        },
      },
    },
  },
  plugins: [typography],
};

export default config;
