const tsPlugin = require('@angular-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const templatePlugin = require('@angular-eslint/eslint-plugin-template');
const templateParser = require('@angular-eslint/template-parser');

module.exports = [
  {
    files: ['src/**/*.ts'],
    plugins: {
      '@angular-eslint': tsPlugin,
    },
    languageOptions: {
      parser: tsParser,
    },
    processor: templatePlugin.processors['extract-inline-html'],
    rules: {
      '@angular-eslint/contextual-lifecycle': 'error',
      '@angular-eslint/no-empty-lifecycle-method': 'error',
      '@angular-eslint/no-input-rename': 'error',
      '@angular-eslint/no-inputs-metadata-property': 'error',
      '@angular-eslint/no-output-native': 'error',
      '@angular-eslint/no-output-on-prefix': 'error',
      '@angular-eslint/no-output-rename': 'error',
      '@angular-eslint/no-outputs-metadata-property': 'error',
      '@angular-eslint/prefer-inject': 'error',
      '@angular-eslint/prefer-standalone': 'error',
      '@angular-eslint/use-pipe-transform-interface': 'error',
      '@angular-eslint/use-lifecycle-interface': 'warn',
    },
  },
  {
    files: ['src/**/*.html'],
    plugins: {
      '@angular-eslint/template': templatePlugin,
    },
    languageOptions: {
      parser: templateParser,
    },
    rules: {
      '@angular-eslint/template/banana-in-box': 'error',
      '@angular-eslint/template/eqeqeq': 'error',
      '@angular-eslint/template/no-negated-async': 'error',
    },
  },
];

