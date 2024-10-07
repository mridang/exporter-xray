import { NodeSDK } from '@opentelemetry/sdk-node';
import {
  ConsoleSpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import { Resource } from '@opentelemetry/resources';
import { SEMRESATTRS_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { AWSXRayPropagator } from '@opentelemetry/propagator-aws-xray';
import { AWSXRayIdGenerator } from '@opentelemetry/id-generator-aws-xray';
import { XraySpanExporter } from '../../src';
import TempFileEmitter from './emitter';

import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import {
  CompositePropagator,
  W3CBaggagePropagator,
  W3CTraceContextPropagator,
} from '@opentelemetry/core';

const sdk = new NodeSDK({
  textMapPropagator: new CompositePropagator({
    propagators: [
      new W3CTraceContextPropagator(),
      new W3CBaggagePropagator(),
      new AWSXRayPropagator(),
    ],
  }),
  idGenerator: new AWSXRayIdGenerator(),
  resource: new Resource({
    [SEMRESATTRS_SERVICE_NAME]: process.env.SERVICE_NAME || 'test',
  }),
  spanProcessors: [
    ...(process.env.DEBUG
      ? [new SimpleSpanProcessor(new ConsoleSpanExporter())]
      : []),
    new SimpleSpanProcessor(
      new XraySpanExporter([new TempFileEmitter()], {
        parseId(id: string): string {
          return id;
        },
      }),
    ),
  ],
  // We found the Node.js auto-instrumentation a bit noisy. There can be a
  // lot of file i/o and a ton of DNS calls you might not be interested in.
  // Luckily, you can easily tweak that by providing some extra options
  // to the getNodeAutoInstrumentations() function. We use the following
  // configuration to filter out some of the noise:
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': {
        enabled: false,
      },
      '@opentelemetry/instrumentation-net': {
        enabled: false,
      },
      '@opentelemetry/instrumentation-dns': {
        enabled: false,
      },
    }),
  ],
});

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ALL);

sdk.start();

process.on('SIGTERM', () => {
  sdk
    .shutdown()
    .then(() => console.log('OpenTelemetry SDK shut down'))
    .catch((error) =>
      console.log('Error shutting down OpenTelemetry SDK', error),
    )
    .finally(() => process.exit(0));
});
