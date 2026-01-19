module.exports = {
  // ... other configurations
  module: {
    rules: [
      {
        test: /\.tsx?$/,   // Matches .ts and .tsx files
        use: 'ts-loader',   // Use ts-loader to compile TypeScript files
        exclude: /node_modules/,
      },
      // other rules
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'], // Resolves TypeScript files
  },
};
