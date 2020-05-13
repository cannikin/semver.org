/* See https://tailwindcss.com/docs/configuration for more options */

module.exports = {
  theme: {
    fontFamily: {
      mono: [
        "Fira Code",
        "Fira Mono",
        "Menlo",
        "Monaco",
        "Consolas",
        "Liberation Mono",
        "Courier New",
        "monospace"
      ]
    },
    linearGradientColors: theme => theme("colors")
  },
  variants: {},
  plugins: [
    require("tailwindcss-gradients")
  ]
};
