import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'Times', 'serif'],
        sans: ['system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        cream: '#faf8f5',
        ink: '#1a1a1a',
        muted: '#6b6b6b',
      },
    },
  },
  plugins: [],
}
export default config
