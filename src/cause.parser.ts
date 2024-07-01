import { Cause } from './xray.document';
import { ReadableSpan } from '@opentelemetry/sdk-trace-base';
import { randomBytes } from 'node:crypto';
import { str, undef } from './util';
import {
  SEMATTRS_EXCEPTION_MESSAGE,
  SEMATTRS_EXCEPTION_STACKTRACE,
  SEMATTRS_EXCEPTION_TYPE,
} from '@opentelemetry/semantic-conventions';
import { SpanKind } from '@opentelemetry/api';

export interface CauseParser {
  getCause(span: ReadableSpan): Cause | undefined;
}

export class DefaultCauseParser implements CauseParser {
  private readonly regex =
    /^\s*at\s+(?:(?<label>[^()]+)\s+\((?<path>[^:]+):(?<line>\d+):\d+\)|(?<path2>[^:]+):(?<line2>\d+):\d+)$/;

  constructor(
    private readonly idGen: () => string = () => randomBytes(8).toString('hex'),
  ) {
    //
  }

  /**
   * Parses the span events to identify the cause of an error, including
   * detailed information about exceptions.
   *
   * Indicate the cause of the error by including a cause object in the
   * segment or subsegment.
   *
   * The cause can be either a 16-character exception ID or an object with the
   * following fields:
   * - working_directory: The full path of the working directory when the
   *   exception occurred.
   * - paths: An array of paths to libraries or modules in use when the
   *   exception occurred.
   * - exceptions: An array of exception objects.
   *
   * Each exception object can include the following optional fields:
   * - id: A 64-bit identifier for the exception, unique among segments in the
   *   same trace, in 16 hexadecimal digits.
   * - message: The exception message.
   * - type: The exception type.
   * - remote: A boolean indicating that the exception was caused by an error
   *   returned by a downstream service.
   * - truncated: An integer indicating the number of stack frames that are
   *   omitted from the stack.
   * - skipped: An integer indicating the number of exceptions that were skipped
   *   between this exception and its child, i.e., the exception that it caused.
   * - cause: Exception ID of the exception's parent, i.e., the exception that
   *   caused this exception.
   * - stack: An array of stackFrame objects.
   *
   * Each stackFrame object can include the following optional fields:
   * - path: The relative path to the file.
   * - line: The line in the file.
   * - label: The function or method name.
   *
   * @returns An object representing the cause of the error, including an array
   *   of parsed exceptions.
   */
  public getCause(span: ReadableSpan): Cause | undefined {
    return span.events.some((event) => event.name === 'exception')
      ? {
          exceptions: undef(
            span.events
              .filter((event) => event.name === 'exception')
              .map((event) => ({
                id: this.idGen(),
                cause: '',
                type: str(event.attributes?.[SEMATTRS_EXCEPTION_TYPE]),
                message: str(event.attributes?.[SEMATTRS_EXCEPTION_MESSAGE]),
                remote: [SpanKind.PRODUCER, SpanKind.CLIENT].includes(
                  span.kind,
                ),
                stack: str(event.attributes?.[SEMATTRS_EXCEPTION_STACKTRACE])
                  ?.split('\n')
                  .map((line) => this.regex.exec(line))
                  .filter(Boolean)
                  .map((match) => ({
                    label: match?.groups?.label || undefined,
                    path: match?.groups?.path || match?.groups?.path2,
                    line: match?.groups?.line
                      ? Number(match.groups.line)
                      : // @ts-expect-error xf wts
                        Number(match.groups.line2),
                  })),
              })),
          ),
        }
      : undefined;
  }
}
