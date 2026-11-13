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
  testPathIgnorePatterns: [
    '/node_modules/',
    '/frontend/',
    '/dist/',
    '<rootDir>/packages/',
  ],
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
