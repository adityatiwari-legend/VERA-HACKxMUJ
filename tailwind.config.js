/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      colors: {
        background: '#09090b',
        foreground: '#ededed',
        mint: '#00f59b',
        surface: '#111113',
        'surface-elevated': '#18181b',
        'surface-base': '#09090b',
        'surface-card-dark': '#111113',
        'surface-card-light': '#FFFFFF',
        'cyber-cyan': {
          DEFAULT: '#06B6D4',
          400: '#22D3EE',
          500: '#06B6D4',
          600: '#0891B2',
        },
        'trust-indigo': {
          DEFAULT: '#6366F1',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
        },
        'alert-amber': {
          DEFAULT: '#F59E0B',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
        },
        'danger-rose': {
          DEFAULT: '#F43F5E',
          400: '#FB7185',
          500: '#F43F5E',
          600: '#E11D48',
        },
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          'emerald-500': '#10B981',
          'emerald-600': '#059669',
          'emerald-glow': 'rgba(16, 185, 129, 0.25)',
        },
        navy: {
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        }
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'glow-mint': '0 0 24px -4px rgba(0, 245, 155, 0.3)',
        'glow-emerald': '0 0 24px -4px rgba(16, 185, 129, 0.3)',
        'glow-cyan': '0 0 24px -4px rgba(6, 182, 212, 0.3)',
        'glow-indigo': '0 0 24px -4px rgba(99, 102, 241, 0.3)',
      },
    },
  },
  plugins: [],
};
