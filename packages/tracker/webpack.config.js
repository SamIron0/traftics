const path = require('path');

module.exports = {
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'tracker.js',
    library: {
      name: 'TrafticsTracker',
      type: 'umd',
      export: 'default'
    },
    globalObject: 'this'
  },
  resolve: {
    extensions: ['.ts', '.js', '.d.ts'],
    alias: {
      '@traftics': path.resolve(__dirname, '../../packages')
    }
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile: path.resolve(__dirname, './tsconfig.json'),
              transpileOnly: true
            }
          }
        ],
        exclude: /node_modules/
      }
    ]
  },
  optimization: {
    minimize: true
  },
  mode: 'production'
};
