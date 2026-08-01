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
        brand: {
          50: '#f5f4fb',
          100: '#eceafc',
          500: '#4f46e5',
          600: '#4338ca',
          700: '#3730a3',
          950: '#0b0a1f',
        },
        success: {
          50: '#ecf8f3',
          600: '#059669',
          700: '#047857',
        },
        ink: '#1b1830',
        muted: '#6b6785',
      },
      fontFamily: {
        sans: ['Manrope', 'Arial', 'Helvetica', 'sans-serif'],
      },
      borderRadius: {
        card: '24px',
        field: '14px',
        action: '16px',
      },
      boxShadow: {
        card: '0 24px 60px rgba(10, 8, 40, 0.35), 0 4px 16px rgba(10, 8, 40, 0.25)',
      },
    },
  },
};

export default config;
