/**
 * Converts OpenTelemetry trace IDs into the AWS X-Ray trace ID format.
 * @file
 */

/**
 * Interface for parsing IDs into a specific format.
 */
export interface IdParser {
  /**
   * Parses the given ID into a specific format.
   * @param id - The ID to parse.
   * @returns The parsed ID in a specific format.
   * @throws Error if the ID is invalid based on validation rules.
   */
  parseId(id: string): string;
}

/**
 * Default implementation of IdParser that converts a trace ID into AWS X-Ray
 * trace ID format.
 *
 * AWS X-Ray trace IDs consist of three parts:
 * - Version number (fixed to '1').
 * - Unix epoch time of the original request in 8 hexadecimal digits.
 * - Globally unique 96-bit identifier for the trace in 24 hexadecimal digits.
 *
 * Example: '1-58406520-a006649127e371903a2de979'.
 * @see {@link https://docs.aws.amazon.com/xray/latest/devguide/aws-xray-api.html}
 */
export class DefaultIdParser implements IdParser {
  constructor(
    private readonly maxAge: number = 60 * 60 * 24 * 28,
    private readonly maxSkew: number = 60 * 5,
  ) {
    //
  }

  /**
   * Parses the given trace ID into AWS X-Ray trace ID format.
   * @param id - The trace ID to parse.
   * @returns The trace ID formatted as AWS X-Ray trace ID.
   * @throws Error if the trace ID is invalid or out of allowed age/skew range.
   * @example
   * ```ts
   * const parser = new DefaultIdParser();
   * const epoch = Math.floor(Date.now() / 1000).toString(16);
   * parser.parseId(`${epoch}a006649127e371903a2de979`);
   * // Returns '1-<epoch>-a006649127e371903a2de979'.
   * ```
   */
  parseId(id: string): string {
    const epochNow = Math.floor(Date.now() / 1000);
    // Extract and parse the epoch time from the trace ID
    const epoch = Number.parseInt(id.slice(0, 8), 16);

    // Validate the epoch time against maximum age and skew limits
    if (
      Number.isNaN(epoch) ||
      epoch < epochNow - this.maxAge ||
      epoch > epochNow + this.maxSkew
    ) {
      throw new Error(`Invalid X-Ray trace ID: ${id}`);
    }

    // Format the trace ID into AWS X-Ray trace ID format
    return `1-${id.slice(0, 8)}-${id.slice(8)}`;
  }
}
