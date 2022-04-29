const path = require('path');

module.exports = {
  entry: './src/mf_display.js',
  output: {
    filename: 'megaforge.min.js',
    path: path.resolve(__dirname, 'dist')
  }
};
