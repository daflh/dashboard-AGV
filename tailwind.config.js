import defaultTheme from 'tailwindcss/defaultTheme'

export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Poppins"', '"Roboto"', ...defaultTheme.fontFamily.sans],
        mont: ['Mont', ...defaultTheme.fontFamily.sans],
        productsans: ['"Product Sans"', ...defaultTheme.fontFamily.sans],
        vagrounded: ['"VAG Rounded Next"', ...defaultTheme.fontFamily.sans] // Tambahkan ini
      },
      lineHeight: {
        12: '4rem'
      },
      colors: {
        primaryred : '#DA0101',
        primaryblue: '#000066'
      }
    }
  },
  plugins: []
}
