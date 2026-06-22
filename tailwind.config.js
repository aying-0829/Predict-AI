/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        vault: {
          'surface-0': '#080808',
          'surface-1': '#161410',
          'surface-2': '#201c18',
          'surface-3': '#2a2520',
          'gold-primary': '#c9a84c',
          'gold-dim': '#8a7a50',
          'gold-glow': '#f0d78c',
        },
      },
      spacing: {
        18: '4.5rem',
        72: '18rem',
        96: '24rem',
        120: '30rem',
      },
      fontSize: {
        mammoth: 'clamp(3rem, 8vw, 6rem)',
        hero: 'clamp(2rem, 5vw, 4rem)',
      },
      fontFamily: {
        serif: ['DM Serif Display', 'Georgia', 'serif'],
        sans: ['Inter Display', 'Inter', 'PingFang SC', "'Microsoft YaHei'", 'sans-serif'],
      },
      animation: {
        marquee: 'marquee 30s linear infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
}
