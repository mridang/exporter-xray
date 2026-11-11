/**
 * Knip configuration that limits unused-code checks for this package.
 * @file
 */

export default {
  ignore: ['knip.config.ts'],
  ignoreDependencies: [/^@semantic-release\//],
};
