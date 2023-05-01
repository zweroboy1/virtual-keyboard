module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: 'eslint-config-airbnb-base',
  overrides: [],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'import/prefer-default-export': 'off',
    'import/extensions': ['error', 'ignorePackages'],
  },
};
