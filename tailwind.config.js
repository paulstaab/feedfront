import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      screens: {
        xs: '320px',
        sm: '768px',
        md: '1024px',
        lg: '1440px',
      },
      colors: {
        surface: 'hsl(var(--color-surface) / <alpha-value>)',
        'surface-muted': 'hsl(var(--color-surface-muted) / <alpha-value>)',
        'surface-elevated': 'hsl(var(--color-surface-elevated) / <alpha-value>)',
        'bg-surface': 'hsl(var(--color-bg-surface) / <alpha-value>)',
        'bg-primary': 'hsl(var(--color-bg-primary) / <alpha-value>)',
        'bg-sidebar': 'hsl(var(--color-bg-sidebar) / <alpha-value>)',
        accent: 'hsl(var(--color-accent) / <alpha-value>)',
        'accent-strong': 'hsl(var(--color-accent-strong) / <alpha-value>)',
        'accent-muted': 'hsl(var(--color-accent-muted) / <alpha-value>)',
        text: 'hsl(var(--color-text) / <alpha-value>)',
        'text-muted': 'hsl(var(--color-text-muted) / <alpha-value>)',
        'text-subtle': 'hsl(var(--color-text-subtle) / <alpha-value>)',
        border: 'hsl(var(--color-border) / <alpha-value>)',
        'border-subtle': 'hsl(var(--color-border-subtle) / <alpha-value>)',
        success: 'hsl(var(--color-success) / <alpha-value>)',
        warning: 'hsl(var(--color-warning) / <alpha-value>)',
        error: 'hsl(var(--color-error) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
        mono: ['"JetBrains Mono"', ...defaultTheme.fontFamily.mono],
      },
      fontSize: {
        xs: 'var(--font-size-xs)',
        sm: 'var(--font-size-sm)',
        base: 'var(--font-size-base)',
        lg: 'var(--font-size-lg)',
        xl: 'var(--font-size-xl)',
        '2xl': 'var(--font-size-2xl)',
        '3xl': 'var(--font-size-3xl)',
      },
      spacing: {
        1.5: '0.375rem',
        4.5: '1.125rem',
        sidebar: 'var(--sidebar-width)',
      },
      borderRadius: {
        xs: 'var(--radius-xs)',
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        full: 'var(--radius-full)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        card: 'var(--shadow-card)',
      },
      transitionDuration: {
        fast: '150ms',
        normal: '200ms',
        slow: '300ms',
      },
      zIndex: {
        sidebar: '40',
        overlay: '50',
        header: '60',
      },
    },
  },
  plugins: [],
};
