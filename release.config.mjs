/**
 * Semantic-release configuration that publishes this package.
 * @file
 */

import { readFileSync } from 'node:fs';

// eslint-disable-next-line n/no-sync -- sync is fine in a release config read once at startup
const packageJsonText = readFileSync(
  new URL('package.json', import.meta.url),
  'utf8',
);
const packageJson = JSON.parse(packageJsonText);

export default {
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    [
      '@semantic-release/npm',
      {
        npmPublish: true,
        pkgRoot: '.',
        tarballDir: '.',
        access: 'public',
      },
    ],
    [
      '@semantic-release/github',
      {
        assets: [{ path: '*.tgz', label: 'Package' }],
      },
    ],
    [
      '@semantic-release/git',
      {
        assets: ['package.json', 'package-lock.json'],
        message:
          'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
      },
    ],
  ],
  repositoryUrl: packageJson.repository.url,
};
