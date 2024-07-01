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
    expect({
      documents: (commandArg.input.TraceSegmentDocuments as string[])?.map(
        (json) => JSON.parse(json),
      ),
    }).toEqual({
      documents: [
        {
          aws: {
            xray: {
              auto_instrumentation: false,
              sdk: 'nodejs/1.25.1',
              sdk_version: '1.25.1',
            },
          },
          cause: {},
          end_time: 1719733144.7892985,
          id: 'c4c9aaec061808db',
          name: 'middleware - query',
          parent_id: '62aa77733a29b899',
          service: {
            name: 'my-express-app',
            runtime: 'nodejs',
            runtime_version: '20.9.0',
            version: 'unknown',
          },
          start_time: 1719733144.789,
          trace_id: '1-371072df-6c811ec31d82d28caf5cddbc',
          type: 'subsegment',
        },
        {
          aws: {
            xray: {
              auto_instrumentation: false,
              sdk: 'nodejs/1.25.1',
              sdk_version: '1.25.1',
            },
          },
          cause: {},
          end_time: 1719733144.7903323,
          id: '5e3863393e4458cc',
          name: 'middleware - expressInit',
          parent_id: '62aa77733a29b899',
          service: {
            name: 'my-express-app',
            runtime: 'nodejs',
            runtime_version: '20.9.0',
            version: 'unknown',
          },
          start_time: 1719733144.79,
          trace_id: '1-371072df-6c811ec31d82d28caf5cddbc',
          type: 'subsegment',
        },
        {
          aws: {
            xray: {
              auto_instrumentation: false,
              sdk: 'nodejs/1.25.1',
              sdk_version: '1.25.1',
            },
          },
          cause: {},
          end_time: 1719733144.792175,
          id: '3810ceb0646ec0c4',
          name: 'request handler - /axios',
          parent_id: '62aa77733a29b899',
          service: {
            name: 'my-express-app',
            runtime: 'nodejs',
            runtime_version: '20.9.0',
            version: 'unknown',
          },
          start_time: 1719733144.792,
          trace_id: '1-371072df-6c811ec31d82d28caf5cddbc',
          type: 'subsegment',
        },
        {
          aws: {
            xray: {
              auto_instrumentation: false,
              sdk: 'nodejs/1.25.1',
              sdk_version: '1.25.1',
            },
          },
          cause: {},
          end_time: 1719733144.7980335,
          id: '5983fc0be789dfb4',
          name: 'fs realpathSync',
          parent_id: '62aa77733a29b899',
          service: {
            name: 'my-express-app',
            runtime: 'nodejs',
            runtime_version: '20.9.0',
            version: 'unknown',
          },
          start_time: 1719733144.798,
          trace_id: '1-371072df-6c811ec31d82d28caf5cddbc',
          type: 'subsegment',
        },
        {
          aws: {
            xray: {
              auto_instrumentation: false,
              sdk: 'nodejs/1.25.1',
              sdk_version: '1.25.1',
            },
          },
          cause: {},
          end_time: 1719733145.1952214,
          http: {
            request: {
              client_ip: '20.248.137.49',
              x_forwarded_for: true,
            },
            response: {
              content_length: 0,
              status: null,
            },
          },
          id: '911b1e2214de58b8',
          name: 'api.github.com',
          parent_id: '59a9a738d9b789bb',
          service: {
            name: 'my-express-app',
            runtime: 'nodejs',
            runtime_version: '20.9.0',
            version: 'unknown',
          },
          start_time: 1719733144.827,
          trace_id: '1-371072df-6c811ec31d82d28caf5cddbc',
          type: 'subsegment',
        },
        {
          aws: {
            xray: {
              auto_instrumentation: false,
              sdk: 'nodejs/1.25.1',
              sdk_version: '1.25.1',
            },
          },
          cause: {},
          end_time: 1719733145.407536,
          id: '59a9a738d9b789bb',
          name: 'tls.connect',
          parent_id: '980a464c5de12e44',
          service: {
            name: 'my-express-app',
            runtime: 'nodejs',
            runtime_version: '20.9.0',
            version: 'unknown',
          },
          start_time: 1719733144.827,
          trace_id: '1-371072df-6c811ec31d82d28caf5cddbc',
          type: 'subsegment',
        },
        {
          aws: {
            xray: {
              auto_instrumentation: false,
              sdk: 'nodejs/1.25.1',
              sdk_version: '1.25.1',
            },
          },
          cause: {},
          end_time: 1719733145.8978295,
          http: {
            request: {
              client_ip: '20.248.137.49',
              method: 'GET',
              url: 'https://api.github.com/',
              x_forwarded_for: true,
            },
            response: {
              content_length: 0,
              status: 200,
            },
          },
          id: '980a464c5de12e44',
          name: 'api.github.com:443',
          namespace: 'remote',
          parent_id: '62aa77733a29b899',
          service: {
            name: 'my-express-app',
            runtime: 'nodejs',
            runtime_version: '20.9.0',
            version: 'unknown',
          },
          start_time: 1719733144.799,
          trace_id: '1-371072df-6c811ec31d82d28caf5cddbc',
          type: 'subsegment',
        },
        {
          aws: {
            xray: {
              auto_instrumentation: false,
              sdk: 'nodejs/1.25.1',
              sdk_version: '1.25.1',
            },
          },
          cause: {},
          end_time: 1719733145.9074056,
          http: {
            request: {
              client_ip: '::1',
              method: 'GET',
              url: 'http://localhost:3000/axios',
              user_agent:
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
              x_forwarded_for: true,
            },
            response: {
              content_length: 0,
              status: 200,
            },
          },
          id: '62aa77733a29b899',
          name: 'my-express-app',
          parent_id: 'undefined',
          service: {
            name: 'my-express-app',
            runtime: 'nodejs',
            runtime_version: '20.9.0',
            version: 'unknown',
          },
          start_time: 1719733144.787,
          trace_id: '1-371072df-6c811ec31d82d28caf5cddbc',
        },
      ],
    });
  });
});
