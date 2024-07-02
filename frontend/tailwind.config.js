/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#16a34a",
        // primaryDark: "#038278",
        secondary: "#2e333d",
        // primary: "#FFF",
        primaryDark: "#038278",
        dark: "#212328",
        danger: "#eb3330",
        success: "#4aac68",
      },
    },
  },
  plugins: [],
};
