/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg:      '#05060f',
        surface: '#0c0e1a',
        card:    '#111527',
        border:  '#1e2240',
        accent:  '#6c63ff',
        cyan:    '#00e5ff',
        green:   '#06ffa5',
        gold:    '#ffd166',
        danger:  '#ff4d6d',
        muted:   '#6b7299',
      },
      backgroundImage: {
        'grid': "linear-gradient(rgba(108,99,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(108,99,255,.04) 1px,transparent 1px)",
      },
    },
  },
  plugins: [],
}
