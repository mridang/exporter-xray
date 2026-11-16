/**
 * Tests for the exception cause parser.
 * @file
 */

import type { ReadableSpan } from '@opentelemetry/sdk-trace-base';
import {
  SEMATTRS_EXCEPTION_MESSAGE,
  SEMATTRS_EXCEPTION_STACKTRACE,
  SEMATTRS_EXCEPTION_TYPE,
} from '@opentelemetry/semantic-conventions';
import { DefaultCauseParser } from '../src/index.js';

/** Matches a 16-character lowercase hexadecimal identifier. */
const HEX_ID_PATTERN = /^[0-9a-f]{16}$/;
import { SpanKind } from '@opentelemetry/api';

describe('cause.parser test', () => {
  let causeParser: DefaultCauseParser;

  beforeEach(() => {
    causeParser = new DefaultCauseParser();
  });

  test('should return undefined if no exception events are present', () => {
    const span: ReadableSpan = {
      events: [],
      kind: SpanKind.INTERNAL,
      // other necessary properties for ReadableSpan
    } as unknown as ReadableSpan;

    expect(causeParser.getCause(span)).toBeUndefined();
  });

  test('should return a cause object if exception events are present', () => {
    const span: ReadableSpan = {
      events: [
        {
          name: 'exception',
          attributes: {
            [SEMATTRS_EXCEPTION_TYPE]: 'Error',
            [SEMATTRS_EXCEPTION_MESSAGE]: 'An error occurred',
            [SEMATTRS_EXCEPTION_STACKTRACE]: new Error('test exception').stack,
          },
        },
      ],
      kind: SpanKind.CLIENT,
    } as unknown as ReadableSpan;

    expect(causeParser.getCause(span)).toEqual({
      exceptions: [
        {
          id: expect.stringMatching(HEX_ID_PATTERN) as unknown,
          type: 'Error',
          message: 'An error occurred',
          remote: true,
          stack: expect.arrayContaining([
            expect.objectContaining({
              label: expect.any(String) as unknown,
              path: expect.any(String) as unknown,
              line: expect.any(Number) as unknown,
            }),
          ]) as unknown,
        },
      ],
    });
  });

  test('should correctly parse multiple exception events', () => {
    const span: ReadableSpan = {
      events: [
        {
          name: 'exception',
          attributes: {
            [SEMATTRS_EXCEPTION_TYPE]: 'Error',
            [SEMATTRS_EXCEPTION_MESSAGE]: 'First error',
            [SEMATTRS_EXCEPTION_STACKTRACE]: new Error('test exception').stack,
          },
        },
        {
          name: 'exception',
          attributes: {
            [SEMATTRS_EXCEPTION_TYPE]: 'TypeError',
            [SEMATTRS_EXCEPTION_MESSAGE]: 'Second error',
            [SEMATTRS_EXCEPTION_STACKTRACE]: new Error('test exception').stack,
          },
        },
      ],
      kind: SpanKind.PRODUCER,
    } as unknown as ReadableSpan;

    expect(causeParser.getCause(span)).toEqual({
      exceptions: [
        {
          id: expect.stringMatching(HEX_ID_PATTERN) as unknown,
          type: 'Error',
          message: 'First error',
          remote: true,
          stack: expect.any(Array) as unknown,
        },
        {
          id: expect.stringMatching(HEX_ID_PATTERN) as unknown,
          type: 'TypeError',
          message: 'Second error',
          remote: true,
          stack: expect.arrayContaining([
            expect.objectContaining({
              label: expect.any(String) as unknown,
              path: expect.any(String) as unknown,
              line: expect.any(Number) as unknown,
            }),
          ]) as unknown,
        },
      ],
    });
  });
});
