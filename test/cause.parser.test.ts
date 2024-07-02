import { ReadableSpan } from '@opentelemetry/sdk-trace-base';
import {
  SEMATTRS_EXCEPTION_MESSAGE,
  SEMATTRS_EXCEPTION_STACKTRACE,
  SEMATTRS_EXCEPTION_TYPE,
} from '@opentelemetry/semantic-conventions';
import { DefaultCauseParser } from '../src/cause.parser';
import { SpanKind } from '@opentelemetry/api';

describe('cause.parser test', () => {
  let causeParser: DefaultCauseParser;

  beforeEach(() => {
    causeParser = new DefaultCauseParser();
  });

  const generateStackTrace = (): string => {
    try {
      throw new Error('Generated stack trace');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      return e.stack;
    }
  };

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
            [SEMATTRS_EXCEPTION_STACKTRACE]: generateStackTrace(),
          },
        },
      ],
      kind: SpanKind.CLIENT,
    } as unknown as ReadableSpan;

    expect(causeParser.getCause(span)).toEqual({
      exceptions: [
        {
          id: expect.stringMatching(/^[0-9a-f]{16}$/),
          type: 'Error',
          message: 'An error occurred',
          remote: true,
          stack: expect.arrayContaining([
            expect.objectContaining({
              label: expect.any(String),
              path: expect.any(String),
              line: expect.any(Number),
            }),
          ]),
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
            [SEMATTRS_EXCEPTION_STACKTRACE]: generateStackTrace(),
          },
        },
        {
          name: 'exception',
          attributes: {
            [SEMATTRS_EXCEPTION_TYPE]: 'TypeError',
            [SEMATTRS_EXCEPTION_MESSAGE]: 'Second error',
            [SEMATTRS_EXCEPTION_STACKTRACE]: generateStackTrace(),
          },
        },
      ],
      kind: SpanKind.PRODUCER,
    } as unknown as ReadableSpan;

    expect(causeParser.getCause(span)).toEqual({
      exceptions: [
        {
          id: expect.stringMatching(/^[0-9a-f]{16}$/),
          type: 'Error',
          message: 'First error',
          remote: true,
          stack: expect.any(Array),
        },
        {
          id: expect.stringMatching(/^[0-9a-f]{16}$/),
          type: 'TypeError',
          message: 'Second error',
          remote: true,
          stack: expect.arrayContaining([
            expect.objectContaining({
              label: expect.any(String),
              path: expect.any(String),
              line: expect.any(Number),
            }),
          ]),
        },
      ],
    });
  });
});
