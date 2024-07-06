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

If you'd like to begin sending traces to XRay and use OpenTelemetry,
you need to use the Lambda layer to send traces to XRay.

https://github.com/open-telemetry/opentelemetry-lambda

This Lambda layer needs to be built and there is no simple way to run
this locally. Of course, you could also run the OpenTelemetry
collector locally

https://github.com/open-telemetry/opentelemetry-collector-contrib

As you can see, for simple setups, this becomes complex. When things
don't work as expected, you need to begin debugging the collector
using the sparse logs it spews.

To get around this, this project reimplements the core logic found
in the "contrib" version of the OpenTelemetry Collector.

Barring a few odd quirks, this project has been meticulously engineered
to main compatibility with XRay and ensures feature parity with the
AWS Exporter in the OpenTelemetry Exporter.

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

---

When writing a custom exporter for OpenTelemetry in Node.js to export spans to
AWS X-Ray, it is crucial to use the `AWSXRayPropagator` and `AWSXRayIdGenerator`
from the `@opentelemetry/propagator-aws-xray` and `@opentelemetry/id-generator-aws-xray`
packages, respectively. Here’s why these components are necessary and what
could happen if they aren’t used:

##### Importance of `AWSXRayPropagator` and `AWSXRayIdGenerator`

1. **Trace Context Propagation**:

   - **AWSXRayPropagator**: This propagator ensures that trace context is
     correctly propagated across different services. It translates the
     OpenTelemetry trace context to the format expected by AWS X-Ray. Without
     this, your traces would lack the necessary context to be linked correctly
     across different services, making it difficult to track a request’s path
     through a distributed system [source](https://docs.aws.amazon.com/xray/latest/devguide/xray-services-adot.html)
     [source](https://aws.amazon.com/blogs/opensource/migrating-x-ray-tracing-to-aws-distro-for-opentelemetry/).
   - **AWSXRayIdGenerator**: AWS X-Ray requires a specific format for trace IDs,
     which includes a timestamp and a unique identifier. The `AWSXRayIdGenerator`
     generates IDs in this format, ensuring compatibility with X-Ray’s
     requirements. Using a different ID generator may result in trace IDs that
     X-Ray cannot recognize, leading to errors or ignored traces
     [source](https://docs.aws.amazon.com/xray/latest/devguide/xray-nodejs.html)
     [source](https://aws.amazon.com/blogs/opensource/migrating-x-ray-tracing-to-aws-distro-for-opentelemetry/).

2. **Integration and Compatibility**:
   - Both components are designed to work seamlessly with AWS X-Ray, ensuring
     that the traces collected by OpenTelemetry are correctly understood and
     processed by X-Ray. They handle specific details like the structure of trace
     IDs and the propagation of context headers, which are essential for
     maintaining the integrity of the trace data
     [source](https://docs.aws.amazon.com/xray/latest/devguide/xray-nodejs.html).

##### Consequences of Not Using These Components

- **Loss of Trace Continuity**: If you do not use the `AWSXRayPropagator`, your
  application might fail to propagate trace context correctly. This can result
  in incomplete traces, where the links between different spans are broken. This
  makes it challenging to get a complete view of the application's performance
  and trace requests across services
  [source](https://github.com/open-telemetry/opentelemetry-java-contrib/issues/1217)
  [source](https://docs.aws.amazon.com/xray/latest/devguide/xray-nodejs.html).

- **Trace Rejection**: Without the `AWSXRayIdGenerator`, the trace IDs generated
  might not meet X-Ray’s format requirements. X-Ray might reject these traces,
  causing a loss of valuable tracing information. This can lead to gaps in your
  monitoring and make it harder to diagnose issues within your application
  [source](https://docs.aws.amazon.com/xray/latest/devguide/xray-nodejs.html).

By ensuring that these components are used, you enable proper trace propagation
and ID generation, which are critical for accurate and effective monitoring with
AWS X-Ray. This results in a more robust observability setup, allowing for
comprehensive tracking and debugging of distributed systems.

---

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

<img width="1165" alt="Screenshot 2024-07-06 at 9 17 25" src="https://github.com/mridang/exporter-xray/assets/327432/21067eb5-983d-4512-9184-18aab38e0357">


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
