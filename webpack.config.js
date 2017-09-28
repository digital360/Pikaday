var path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'pikaday.js',
    library: 'Pikaday',
    libraryTarget: 'umd'
  }
}