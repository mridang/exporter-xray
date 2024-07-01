import { readFileSync } from 'fs';
import { join } from 'path';
import XraySpanExporter from '../src/xray.exporter';
import { ExportResultCode } from '@opentelemetry/core';
import { SpanData, WrappedReadableSpan } from './test.span';
import { XRayClient } from '@aws-sdk/client-xray';
import { DefaultIdParser } from '../src/id.parser';

jest.mock('@aws-sdk/client-xray', () => {
  return {
    XRayClient: jest.fn().mockImplementation(() => {
      return {
        send: jest.fn().mockResolvedValue({
          UnprocessedTraceSegments: [],
        }),
        destroy: jest.fn(),
      };
    }),
    PutTraceSegmentsCommand: jest.fn().mockImplementation((input) => {
      return { input }; // Mock implementation to capture the input
    }),
  };
});

describe('XraySpanExporter', () => {
  let exporter: XraySpanExporter;
  let mockXRayClient: XRayClient;

  beforeAll(() => {
    mockXRayClient = new XRayClient();
    exporter = new XraySpanExporter(
      mockXRayClient,
      new DefaultIdParser(Number.MAX_VALUE, Number.MAX_VALUE),
    );
  });

  test(`should export the span from`, async () => {
    const filePath = join(__dirname, 'samples', 'request.axios.json');
    const rawData = readFileSync(filePath, 'utf-8');
    const parsedData = JSON.parse(rawData) as SpanData[];

    expect(
      await new Promise((resolve) => {
        exporter.export(
          parsedData.map((span) => new WrappedReadableSpan(span)),
          resolve,
        );
      }),
    ).toEqual({ code: ExportResultCode.SUCCESS });

    const commandArg = (mockXRayClient.send as jest.Mock).mock.calls[0][0];
    const traceSegmentDocuments = commandArg.input.TraceSegmentDocuments;

    expect(traceSegmentDocuments).toBeDefined();
    expect(traceSegmentDocuments.length).toBe(parsedData.length);

    parsedData.forEach((spanData, index) => {
      expect(JSON.parse(traceSegmentDocuments[index])).toEqual({
        aws: {
          xray: {
            auto_instrumentation: false,
            sdk: 'nodejs/1.25.1',
            sdk_version: '1.25.1',
          },
        },
        cause: {},
        end_time: -1719733144.7887018,
        error: false,
        fault: false,
        id: 'c4c9aaec061808db',
        name: 'middleware - query',
        parent_id: '62aa77733a29b899',
        start_time: expect.anything(),
        throttle: false,
        trace_id: '1-371072df-6c811ec31d82d28caf5cddbc',
        type: 'subsegment',
      });
    });
  });
});
