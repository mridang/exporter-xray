// eslint-disable-next-line @typescript-eslint/no-var-requires
const packageJson = require('./package.json');

module.exports = {
  branches: ['master'],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    [
      '@semantic-release/npm',
      {
        npmPublish: true,
        pkgRoot: '.',
        tarballDir: 'dist',
        access: 'public',
      },
    ],
    [
      '@semantic-release/github',
      {
        assets: [{ path: 'dist/**', label: 'Distribution files' }],
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
