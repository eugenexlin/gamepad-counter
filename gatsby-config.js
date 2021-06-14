module.exports = {
    siteMetadata: {
        title: "gamepad counter",
    },
    plugins: [
        "gatsby-plugin-sass",
        "gatsby-plugin-typescript",
        {
          resolve: 'gatsby-plugin-material-ui',
          // If you want to use styled components you should change the injection order.
          options: {
            // stylesProvider: {
            //   injectFirst: true,
            // },
          },
        },
    ],
    pathPrefix: "/gamepad-counter",
};
