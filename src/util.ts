import net from 'node:net';

/**
 * Converts a high-resolution time (HrTime) tuple into seconds.
 * @param { [number, number] } timestamp - The high-resolution time tuple
 * [seconds, nanoseconds].
 * @returns { number } The timestamp converted to seconds.
 */
export function hrt(timestamp: [number, number]): number {
  return timestamp[0] + timestamp[1] / 1e9;
}

/**
 * Converts an unknown object to its stringified version.
 * @param { unknown } aValue - The object to convert to string.
 * @returns { string | undefined } The object converted to string.
 */
export function str(aValue: unknown): string | undefined {
  return aValue ? aValue?.toString() : undefined;
}

/**
 * Validates an IP address.
 * @param { string } [ip] - The IP address to validate.
 * @returns { string | undefined } The validated IP address, or undefined
 * if invalid.
 */
export function ip(ip?: string): string | undefined {
  return net.isIP(ip || '') ? ip : undefined;
}

/**
 * Returns the array if it contains elements, otherwise undefined.
 * @param { T[] } arr - The array to check.
 * @returns { T[] | undefined } The array if not empty, otherwise undefined.
 */
export function undef<T>(arr: T[]): T[] | undefined {
  return arr?.length > 0 ? arr : undefined;
}
