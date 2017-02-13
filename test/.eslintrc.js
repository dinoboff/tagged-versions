module.exports = {
  extends: require.resolve('../.eslintrc.js'),
  parserOptions: {
    ecmaFeatures: {
      jsx: false,
      experimentalObjectRestSpread: false,
    },
    ecmaVersion: '2017',
    sourceType: 'module',
  },
  rules: {
    'import/no-extraneous-dependencies': [
      'error', {
        devDependencies: true
      }
    ]
  },
};
