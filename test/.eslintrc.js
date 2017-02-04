module.exports = {
  extends: require.resolve('../.eslintrc.js'),
  rules: {
    'import/no-extraneous-dependencies': [
      'error', {
        devDependencies: true
      }
    ]
  },
};
