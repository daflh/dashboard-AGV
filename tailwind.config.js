const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Roboto"', ...defaultTheme.fontFamily.sans],
        mont: ['Mont', ...defaultTheme.fontFamily.sans],
        productsans: ['"Product Sans"', ...defaultTheme.fontFamily.sans],
        vagrounded: ['"VAG Rounded Next"', ...defaultTheme.fontFamily.sans] // Tambahkan ini
      },
      lineHeight: {
        12: '4rem'
      },
      colors: {
        softred: '#eb5f61', // ocean blue (primary)
        darkcornflowerblue: '#263e7c', // dark blue (primary)
        lavenderblue: '#ccdafc', // subtle blue (primary)
        aliceblue: '#eef8fc',
        softgray: '#F9F9F9',
        primarygreen: '#1D5966',
        secondarygreen: '#497E8A',
        blue: '#000066'
      }
    }
  },
  plugins: []
}
