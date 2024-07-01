# OpenTelemetry AWS X-Ray Trace Exporter

A plugin for the Serverless framework to export traces to AWS X-Ray.

This exporter allows the user to send collected traces to AWS X-Ray, a service that helps with the monitoring and troubleshooting of microservices applications. It collects data about the requests that your application serves and provides tools you can use to view, filter, and gain insights into that data to identify issues and opportunities for optimization.

## Installation

Install using NPM by using the following command:

```sh
npm install --save @mridang/exporter-xray @opentelemetry/id-generator-aws-xray @opentelemetry/propagator-aws-xray
```

## Usage in Node and Browser

First, set up the necessary dependencies and instantiate the AWS X-Ray exporter:

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

You can inject the `xRayClient` and other dependencies into the `XraySpanExporter` to customize its behavior:

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

## Viewing your traces

Please visit the AWS X-Ray console to view your traces: <https://console.aws.amazon.com/xray/home>

## Useful links

- For more information on OpenTelemetry, visit: <https://opentelemetry.io/>
- For more about OpenTelemetry JavaScript: <https://github.com/open-telemetry/opentelemetry-js>
- For AWS X-Ray, visit: <https://aws.amazon.com/xray/>
- For help or feedback on this project, join us in [GitHub Discussions](https://github.com/open-telemetry/opentelemetry-js/discussions)

## Contributing

If you have suggestions for how this exporter could be improved, or want to report a bug, open an issue - we'd love all and any contributions.

## License

Apache License 2.0 © 2024 [Your Name]

[discussions-url]: https://github.com/open-telemetry/opentelemetry-js/discussions
[license-url]: https://github.com/open-telemetry/opentelemetry-js/blob/main/LICENSE
[license-image]: https://img.shields.io/badge/license-Apache_2.0-green.svg?style=flat
[npm-url]: https://www.npmjs.com/package/@opentelemetry/exporter-aws-xray
[npm-img]: https://badge.fury.io/js/%40opentelemetry%2Fexporter-aws-xray.svg
