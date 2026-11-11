/**
 * Jest global teardown that stops no external services.
 * @file
 */

/**
 * Stops the external services started for the test suite, which is none.
 * @example
 * ```ts
 * // Jest runs this automatically through globalSetup or globalTeardown.
 * ```
 */
export default async function teardown(): Promise<void> {
  // No external services to tear down.
}
