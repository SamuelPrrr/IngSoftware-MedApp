/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: '#1372DF',
        primaryHover: '#093970',
        primary50: '#D6E7FB',
        primary100: '#84B8F4'
      }
    },
  },
  plugins: [],
}

