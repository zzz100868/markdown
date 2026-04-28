/**
 * Tailwind CSS 配置文件
 */

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // 核心中性色阶 —— 去 AI 味，走高级灰白路线
        ink: {
          DEFAULT: '#171717',
          light: '#404040',
          muted: '#525252',
        },
        stone: {
          50: '#fafafa',
          100: '#f5f5f5',
          150: '#eeeeee',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
        // 语义化别名
        surface: '#ffffff',
        'surface-subtle': '#fafafa',
        'surface-hover': '#f5f5f5',
        'surface-active': '#eeeeee',
        border: '#e5e5e5',
        'border-subtle': '#f0f0f0',
        'border-strong': '#d4d4d4',
        'text-primary': '#171717',
        'text-secondary': '#525252',
        'text-tertiary': '#737373',
        'text-quaternary': '#a3a3a3',
        // 保留极克制的强调色（仅用于交互反馈）
        accent: '#171717',
        'accent-hover': '#404040',
        'accent-subtle': '#f5f5f5',
      },
      height: {
        header: '56px',
      },
      maxWidth: {
        body: '1560px',
      },
      width: {
        sidebar: '248px',
        'sidebar-collapsed': '44px',
      },
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          '"Noto Sans"',
          'sans-serif',
        ],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      boxShadow: {
        'soft': '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
        'card': '0 4px 16px -2px rgba(0, 0, 0, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.02)',
        'card-hover': '0 8px 24px -4px rgba(0, 0, 0, 0.08), 0 4px 8px -2px rgba(0, 0, 0, 0.03)',
        'header': '0 1px 0 rgba(0, 0, 0, 0.05)',
        'float': '0 12px 32px -8px rgba(0, 0, 0, 0.12), 0 4px 8px -2px rgba(0, 0, 0, 0.04)',
        'inset': 'inset 0 1px 2px rgba(0, 0, 0, 0.04)',
      },
      borderRadius: {
        '2xl': '0.75rem',
        '3xl': '1rem',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'snappy': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      letterSpacing: {
        'tight-2': '-0.02em',
        'wide-2': '0.02em',
      },
      lineHeight: {
        'snugish': '1.4',
      },
    },
  },
  plugins: [],
}
