const typescriptParser = require('@typescript-eslint/parser');
const typescriptPlugin = require('@typescript-eslint/eslint-plugin');
const prettierPlugin = require('eslint-plugin-prettier');
const globals = require('globals');

module.exports = [
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '.serverless',
      '.github',
      '.gitignore',
      '.idea',
      '.nvmrc',
      '.env',
      '.prettierignore',
      '.out',
    ],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      globals: { ...globals.node, ...globals.es2021 },
      sourceType: 'module',
      parser: typescriptParser,
      parserOptions: {
        project: './tsconfig.jest.json',
      },
    },
    plugins: {
      '@typescript-eslint': typescriptPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      '@typescript-eslint/no-floating-promises': 'error',
      ...typescriptPlugin.configs.recommended.rules,
      ...prettierPlugin.configs.recommended.rules,
    },
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      globals: { ...globals.node, ...globals.es2021 },
      sourceType: 'module',
    },
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      ...prettierPlugin.configs.recommended.rules,
    },
  },
];
