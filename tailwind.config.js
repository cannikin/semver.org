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
    linearGradients: theme => ({
      colors: theme("colors")
    }),
    radialGradients: theme => ({
      colors: theme("colors")
    }),
    conicGradients: theme => ({
      colors: theme("colors")
    })
  },
  variants: {},
  plugins: [require("tailwindcss-gradients")()]
};
