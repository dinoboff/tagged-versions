module.exports = {
  extends: 'airbnb-base',
  parserOptions: {
    sourceType: 'script', // https://github.com/eslint/eslint/issues/5301
  },
  rules: {
    'max-len': ['error',
      {
        code: 200,
        tabWidth: 2,
      },
    ],
    'comma-dangle': [
      'error',
      {
        arrays: 'always-multiline',
        objects: 'always-multiline',
        imports: 'always-multiline',
        exports: 'always-multiline',
        functions: 'never',
      },
    ],
  },
};
