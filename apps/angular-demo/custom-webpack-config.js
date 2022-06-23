const { merge } = require('webpack-merge');

function insertIntoTristanShadowDom(elt) {
  console.log('inserting styles...', elt);
  document.querySelector('app-react-tristan-summary').shadowRoot.appendChild(elt);
}

module.exports = (config, context) => {
  return merge(config, {
    module: {
      rules: [
        {
          test: /\.css$/i,
          use: [
          {
            loader: 'style-loader',
            options: {
              // Do not forget that this code will be used in the browser and
              // not all browsers support latest ECMA features like `let`, `const`, `arrow function expression` and etc,
              // we recommend use only ECMA 5 features,
              // but it is depends what browsers you want to support
              insert: insertIntoTristanShadowDom
            }
          }, 'css-loader'],
        },
      ],
    },
  });
};
