import { readFile } from 'node:fs/promises';

/**
 * The patterns of this directory's `.gitignore`, as `<rootDir>`-anchored regex
 * strings for Jest's path ignore options.
 *
 * ESLint (`includeIgnoreFile`) and Prettier (`--ignore-path`) read `.gitignore`
 * on their own, but Jest has no such option: it crawls every directory under
 * `rootDir`. Agent worktrees live in `.claude/worktrees/` inside the checkout,
 * so without this Jest treats each of those full repo copies as source and runs
 * every suite once per copy.
 *
 * Follows the gitignore rules for comments, escapes, a leading or inner slash
 * (anchored to the root), a trailing slash (directory), `*`, `?`, `[a-z]` and
 * `**`. A later `!` pattern re-includes what it matches. As in git, a file that
 * is inside an ignored directory cannot be re-included. Falls back to
 * `.claude/`, `node_modules/` and `dist/` when there is no `.gitignore`.
 */
const gitignore = await readFile(
  new URL('.gitignore', import.meta.url),
  'utf8',
).catch(() => '.claude/\nnode_modules/\ndist/\n');

/** What each gitignore wildcard means as a regular expression. */
const WILDCARDS = {
  '**/': '(?:.*/)?',
  '/**': '/.*',
  '**': '.*',
  '*': '[^/]*',
  '?': '[^/]',
};

const ignoredPatterns = gitignore
  .split(/\r?\n/)
  .map((line) => line.trimEnd())
  .filter((line) => line !== '' && !line.startsWith('#'))
  .map((line) => {
    const negated = line.startsWith('!');
    const entry = (negated ? line.slice(1) : line).replace(/^\\(?=[#!])/, '');

    const hasInnerSlash = entry.slice(0, -1).includes('/');
    const anchored = entry.startsWith('/') || hasInnerSlash;

    const regex = entry
      .replace(/^\//, '')
      .replace(/\/$/, '')
      .replaceAll(
        /\*\*\/|\/\*\*|\*\*|\*|\?|\\.|[.+^${}()|/]/g,
        (token) => WILDCARDS[token] ?? `\\${token.replace(/^\\/, '')}`,
      );

    const prefix = anchored ? '' : '(?:.*/)?';
    return { negated, pattern: `${prefix}${regex}(?:/|$)` };
  })
  .flatMap((rule, index, rules) => {
    if (rule.negated) {
      return [];
    }

    const reincluded = rules
      .slice(index + 1)
      .filter((later) => later.negated)
      .map((later) => later.pattern);

    if (reincluded.length === 0) {
      return [`<rootDir>/${rule.pattern}`];
    }
    return [`<rootDir>/(?!${reincluded.join('|')})${rule.pattern}`];
  });

export default {
  preset: 'ts-jest/presets/default-esm',
  transform: {
    '^.+\\.m?[tj]sx?$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: '<rootDir>/tsconfig.jest.json',
      },
    ],
  },
  testEnvironment: 'node',
  testMatch: ['**/*.+(spec|test).[tj]s?(x)'],
  moduleFileExtensions: [
    'ts',
    'tsx',
    'js',
    'mjs',
    'jsx',
    'mts',
    'json',
    'node',
  ],
  testPathIgnorePatterns: ['/node_modules/', ...ignoredPatterns],
  modulePathIgnorePatterns: ignoredPatterns,
  resetModules: false,
  globalSetup: './test/setup.ts',
  globalTeardown: './test/teardown.ts',
  collectCoverage: true,
  coverageDirectory: './.out',
  collectCoverageFrom: ['src/**/*.{ts,tsx,js,jsx}', '!src/**/*.d.ts'],
  coverageReporters: ['lcov', 'text'],
  coveragePathIgnorePatterns: ['/dist/', '/node_modules/'],
  testTimeout: 60_000,
  extensionsToTreatAsEsm: ['.ts', '.tsx', '.mts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    // The app's `@/` alias for src/, so components and pages can be tested.
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: './.out',
        outputName: 'junit.xml',
      },
    ],
  ],
};
