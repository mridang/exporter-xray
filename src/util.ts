/**
 * Small helpers that normalise OpenTelemetry attribute values for AWS X-Ray.
 * @file
 */
import net from 'node:net';

/**
 * Converts a high-resolution time (HrTime) tuple into seconds.
 * @param timestamp - The high-resolution time tuple
 * [seconds, nanoseconds].
 * @returns The timestamp converted to seconds.
 * @example
 * ```ts
 * hrt([1_719_733_145, 500_000_000]); // Returns 1719733145.5.
 * ```
 */
export function hrt(timestamp: [number, number]): number {
  return timestamp[0] + timestamp[1] / 1e9;
}

/**
 * Converts an unknown object to its stringified version.
 * @param aValue - The object to convert to string.
 * @returns The object converted to string.
 * @example
 * ```ts
 * str(42); // Returns '42'.
 * str(undefined); // Returns undefined.
 * ```
 */
export function str(aValue: unknown): string | undefined {
  return aValue ? aValue?.toString() : undefined;
}

/**
 * Validates an IP address.
 * @param [ip] - The IP address to validate.
 * @returns The validated IP address, or undefined
 * if invalid.
 * @example
 * ```ts
 * ip('10.0.0.1'); // Returns '10.0.0.1'.
 * ip('not-an-ip'); // Returns undefined.
 * ```
 */
export function ip(ip?: string): string | undefined {
  return net.isIP(ip || '') ? ip : undefined;
}

/**
 * Returns the array if it contains elements, otherwise undefined.
 * @template T - The type of the array elements.
 * @param arr - The array to check.
 * @returns The array if not empty, otherwise undefined.
 * @example
 * ```ts
 * undef([1, 2]); // Returns [1, 2].
 * undef([]); // Returns undefined.
 * ```
 */
export function undef<T>(arr: T[]): T[] | undefined {
  return arr?.length > 0 ? arr : undefined;
}

/**
 * Converts an unknown input to a number if possible, otherwise returns undefined.
 * @param num - The input to convert.
 * @returns The number if it is a valid number, otherwise undefined.
 * @example
 * ```ts
 * num('12.5'); // Returns 12.5.
 * num('abc'); // Returns undefined.
 * ```
 */
export function num(num: unknown): undefined | number {
  if (!num) {
    return undefined;
  }
  const parsed = Number(num);
  return Number.isNaN(parsed) ? undefined : parsed;
}
