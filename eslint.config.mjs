import { fileURLToPath } from 'node:url';
import { includeIgnoreFile } from '@eslint/compat';
import mridangPlugin from '@mridang/eslint-defaults';

export default [
  includeIgnoreFile(fileURLToPath(new URL('.gitignore', import.meta.url))),
  ...mridangPlugin.configs.recommended,
];
