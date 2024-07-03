# OpenTelemetry AWS X-Ray Trace Exporter

An exporter for OpenTelemetry that allows the user to send the
collected traces to AWS X-Ray.

This exporter allows the user to send collected traces to AWS X-Ray,
a service that helps with the monitoring and troubleshooting of
microservices applications. It collects data about the requests
that your application serves and provides tools you can use to view,
filter, and gain insights into that data to identify issues and
opportunities for optimization.

### Why?

## Installation

Install using NPM by using the following command:

```sh
npm install --save @mridang/exporter-xray
```

## Usage

First, set up the necessary dependencies and instantiate the AWS X-Ray
exporter:

```js
const { AWSXRayPropagator } = require('@opentelemetry/propagator-aws-xray');
const { AWSXRayIdGenerator } = require('@opentelemetry/id-generator-aws-xray');
const { XraySpanExporter } = require('@mridang/exporter-xray');

// Configure the OpenTelemetry SDK to use AWS X-Ray for context propagation and ID generation
const propagator = new AWSXRayPropagator();
const idGenerator = new AWSXRayIdGenerator();
const exporter = new XraySpanExporter();

// Register the exporter and start tracing
tracer.addSpanProcessor(new BatchSpanProcessor(exporter));
```

### Options

You can inject the `xRayClient` and other dependencies into the
`XraySpanExporter` to customize its behavior:

```js
const {
  DefaultIdParser,
  DefaultCauseParser,
  DefaultHttpParser,
} = require('your-parser-modules');

// Instantiate the parsers
const idParser = new DefaultIdParser();
const causeParser = new DefaultCauseParser();
const httpParser = new DefaultHttpParser();

// Instantiate the custom exporter with injected dependencies
const exporter = new XraySpanExporter(
  xRayClient,
  idParser,
  causeParser,
  httpParser,
);
```

### Emitter Configuration

The exporter supports two approaches for emitting trace segments:

The **SDK-Based Emitter** uses the AWS X-Ray SDK to send trace segments
and is recommended for environments outside AWS Lambda. This is slower
as it uses a TCP-based transport but is easier to set up.

The **UDP Daemon Emitter** sends trace segments to the X-Ray daemon
using UDP and is recommended for AWS Lambda environments where the
daemon is typically running. By default, this emitter emits segments
over UDP to the daemon running on localhost at port 2000, but you can
switch this by using the `AWS_XRAY_DAEMON_ADDRESS` environment variable.
https://docs.aws.amazon.com/xray/latest/devguide/xray-daemon.html

The exporter defaults to using the `UDPDaemonSegmentEmitter` when
running on AWS Lambda, and the `SDKBasedSegmentEmitter` otherwise.
This is determined automatically based on the presence of the
`AWS_LAMBDA_FUNCTION_NAME` environment variable. No additional setup is
needed as the daemon is already running on Lambda environments.

### Viewing your traces

Please visit the AWS X-Ray console to view your traces:
<https://console.aws.amazon.com/xray/home>

## Known Issues

When sending SQL segments there is no support for sending these fields as
they aren't added:

- `database_version` – The version number of the database engine.
- `driver_version` – The version number of the database driver
- `preparation` - A flag indicating whether query or statement

This is because these fields aren't part of the OpenTelemetry Semantic
Conventions and therefore is never set as a part of the automatic
instrumentation e.g. [in the MySQL instrumentation](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/0af1b70f7c3c9763c85ac51fa5e334c1e1512020/plugins/node/opentelemetry-instrumentation-mysql).

There doesn't seem to be any support for AWS AppRunner. This means that
when the origin is reported in Xray, there is no way to denote that the
instrumentation was running on AppRunner.
Even [OpenTelemetry internally has no mention of AppRunner](https://github.com/open-telemetry/opentelemetry-js/blob/v1.25.1/packages/opentelemetry-semantic-conventions/src/resource/SemanticResourceAttributes.ts#L1204-L1208)
but there [are some references to it](https://github.com/open-telemetry/opentelemetry-python/blob/72be755db4dc747cff9e647266edc784ad750efa/opentelemetry-semantic-conventions/src/opentelemetry/semconv/_incubating/attributes/cloud_attributes.py#L86) which means that may be incubating

There is no documentation around span links and therefore, while this
feature has been implemented, it may or may not work. There was code in
the original collector to manage span links, but I don't see any mention
of this any of the AWS SDKs.

log references

## Useful links

- For more information on OpenTelemetry, visit: <https://opentelemetry.io/>
- For more about OpenTelemetry JavaScript: <https://github.com/open-telemetry/opentelemetry-js>
- For AWS X-Ray, visit: <https://aws.amazon.com/xray/>

## Contributing

If you have suggestions for how this app could be improved, or
want to report a bug, open an issue - we'd love all and any
contributions.

## License

Apache License 2.0 © 2024 Mridang Agarwalla
