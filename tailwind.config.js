/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: '#161622',
        secondary: '#1372DF',
        secondaryHover: '#093970',
        secondary50: '#D6E7FB',
        secondary100: '#84B8F4',
        terciary: '#31D0AA',
        error: '#FF4545'
      }
    },
  },
  plugins: [],
}

