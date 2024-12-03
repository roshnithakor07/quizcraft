/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif:   ["'Playfair Display'", "Georgia", "serif"],
        sans:    ["'DM Sans'", "sans-serif"],
        mono:    ["'DM Mono'", "monospace"],
      },
      colors: {
        ink:     "#1a1208",
        paper:   "#faf6ef",
        cream:   "#f0e9db",
        warm:    "#e8dcc8",
        amber:   "#d97706",
        ember:   "#c2410c",
        sage:    "#4d7c5f",
        muted:   "#8a7a65",
        border:  "#d9ceba",
      },
      keyframes: {
        rise:    { "0%": { opacity: 0, transform: "translateY(16px)" }, "100%": { opacity: 1, transform: "translateY(0)" } },
        pop:     { "0%": { opacity: 0, transform: "scale(0.95)" },      "100%": { opacity: 1, transform: "scale(1)" } },
        correct: { "0%,100%": { transform: "translateX(0)" },           "25%": { transform: "translateX(4px)" }, "75%": { transform: "translateX(-4px)" } },
        shake:   { "0%,100%": { transform: "translateX(0)" },           "20%,60%": { transform: "translateX(-6px)" }, "40%,80%": { transform: "translateX(6px)" } },
        count:   { "0%": { opacity: 0, transform: "scale(1.4)" },       "100%": { opacity: 1, transform: "scale(1)" } },
      },
      animation: {
        rise:    "rise 0.4s ease-out both",
        pop:     "pop 0.3s ease-out both",
        correct: "correct 0.3s ease-out",
        shake:   "shake 0.4s ease-out",
        count:   "count 0.35s ease-out both",
      },
    },
  },
  plugins: [],
};
