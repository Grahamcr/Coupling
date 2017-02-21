const config = require('../../server/webpack.config');
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const jsPath = path.resolve(__dirname, './');
const nodeExternals = require('webpack-node-externals');

config.entry = {
  config: path.resolve(jsPath, './protractor-conf.ts'),
  test: path.resolve(jsPath, './test.js')
};

config.output = {
  path: path.resolve(__dirname, '.tmp'),
  filename: '[name].js',
  libraryTarget: 'commonjs'
};

config.module.loaders.push({
  test: /\.(css)$/,
  loader: ExtractTextPlugin.extract({
    fallback: 'style-loader',
    use: 'css-loader?' + JSON.stringify({minimize: true})
  })
});

config.plugins.push(new ExtractTextPlugin({filename: './styles.css', allChunks: true}));

config.target = 'node';
config.externals = [nodeExternals()];
module.exports = config;
