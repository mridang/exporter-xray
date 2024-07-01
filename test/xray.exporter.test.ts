import { readFileSync } from 'fs';
import { join } from 'path';
import XraySpanExporter from '../src/xray.exporter';
import { ExportResultCode } from '@opentelemetry/core';
import { SpanData, WrappedReadableSpan } from './test.span';
import { XRayClient } from '@aws-sdk/client-xray';
import { DefaultIdParser } from '../src/id.parser';
import { DefaultCauseParser } from '../src/cause.parser';
import { DefaultHttpParser } from '../src/http.parser';
import { DefaultNameParser } from '../src/name.parser';

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
      new DefaultCauseParser(() => '0'),
      new DefaultHttpParser(),
      new DefaultNameParser(),
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
          end_time: 1719733145.1952214,
          http: {
            request: {
              client_ip: '20.248.137.49',
              x_forwarded_for: true,
            },
            response: {
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
          end_time: 1719733145.8978295,
          http: {
            request: {
              client_ip: '20.248.137.49',
              method: 'GET',
              url: 'https://api.github.com/',
              x_forwarded_for: true,
            },
            response: {
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

  test(`should export the span from 500`, async () => {
    const filePath = join(__dirname, 'samples', 'error.500.json');
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
          end_time: 1719764433.357114,
          id: 'ddb35325923b5aa8',
          name: 'middleware - query',
          parent_id: '2d584e7814b156b1',
          service: {
            name: 'my-express-app',
            runtime: 'nodejs',
            runtime_version: '20.9.0',
            version: 'unknown',
          },
          start_time: 1719764433.357,
          trace_id: '1-1d7e1449-38d0f46254a972e21bcec6ef',
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
          end_time: 1719764433.358084,
          id: '1f6eb2a12f2a2144',
          name: 'middleware - expressInit',
          parent_id: '2d584e7814b156b1',
          service: {
            name: 'my-express-app',
            runtime: 'nodejs',
            runtime_version: '20.9.0',
            version: 'unknown',
          },
          start_time: 1719764433.358,
          trace_id: '1-1d7e1449-38d0f46254a972e21bcec6ef',
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
          end_time: 1719764433.3610158,
          id: 'c39d2fe791f604fa',
          name: 'request handler - /error500',
          parent_id: '2d584e7814b156b1',
          service: {
            name: 'my-express-app',
            runtime: 'nodejs',
            runtime_version: '20.9.0',
            version: 'unknown',
          },
          start_time: 1719764433.361,
          trace_id: '1-1d7e1449-38d0f46254a972e21bcec6ef',
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
          cause: {
            exceptions: [
              {
                cause: '',
                id: '0',
                message: 'boox',
                remote: false,
                stack: [
                  {
                    label:
                      '/Users/mridang/Junk/tmp-express-js-xray/app.js:53:23',
                  },
                  {
                    label: 'Layer.handle [as handle_request]',
                    line: 95,
                    path: '/Users/mridang/Junk/tmp-express-js-xray/node_modules/express/lib/router/layer.js',
                  },
                  {
                    label: 'next',
                    line: 149,
                    path: '/Users/mridang/Junk/tmp-express-js-xray/node_modules/express/lib/router/route.js',
                  },
                  {
                    label: 'Route.dispatch',
                    line: 119,
                    path: '/Users/mridang/Junk/tmp-express-js-xray/node_modules/express/lib/router/route.js',
                  },
                  {
                    label: 'patched',
                    line: 214,
                    path: '/Users/mridang/Junk/tmp-express-js-xray/node_modules/@opentelemetry/instrumentation-express/build/src/instrumentation.js',
                  },
                  {
                    label: 'Layer.handle [as handle_request]',
                    line: 95,
                    path: '/Users/mridang/Junk/tmp-express-js-xray/node_modules/express/lib/router/layer.js',
                  },
                  {
                    label:
                      '/Users/mridang/Junk/tmp-express-js-xray/node_modules/express/lib/router/index.js:284:15',
                  },
                  {
                    label: 'Function.process_params',
                    line: 346,
                    path: '/Users/mridang/Junk/tmp-express-js-xray/node_modules/express/lib/router/index.js',
                  },
                  {
                    label: 'next',
                    line: 280,
                    path: '/Users/mridang/Junk/tmp-express-js-xray/node_modules/express/lib/router/index.js',
                  },
                  {
                    label: 'arguments.<computed>',
                    line: 210,
                    path: '/Users/mridang/Junk/tmp-express-js-xray/node_modules/@opentelemetry/instrumentation-express/build/src/instrumentation.js',
                  },
                ],
                type: 'Error',
              },
            ],
          },
          end_time: 1719764433.3646984,
          error: true,
          http: {
            request: {
              client_ip: '::1',
              method: 'GET',
              url: 'http://localhost:3000/error500',
              user_agent:
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
              x_forwarded_for: true,
            },
            response: {
              status: 500,
            },
          },
          id: '2d584e7814b156b1',
          name: 'my-express-app',
          parent_id: 'undefined',
          service: {
            name: 'my-express-app',
            runtime: 'nodejs',
            runtime_version: '20.9.0',
            version: 'unknown',
          },
          start_time: 1719764433.356,
          trace_id: '1-1d7e1449-38d0f46254a972e21bcec6ef',
        },
      ],
    });
  });
});
