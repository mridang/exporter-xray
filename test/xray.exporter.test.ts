import { readFileSync } from 'fs';
import { join } from 'path';
import XraySpanExporter from '../src/xray.exporter';
import { ExportResult } from '@opentelemetry/core';
import { SpanData, WrappedReadableSpan } from './test.span';
import { XRayClient } from '@aws-sdk/client-xray';
import { DefaultIdParser } from '../src/id.parser';

describe('XraySpanExporter', () => {
  let exporter: XraySpanExporter;

  beforeAll(() => {
    exporter = new XraySpanExporter(
      new XRayClient(),
      new DefaultIdParser(Number.MAX_VALUE, Number.MAX_VALUE),
    );
  });

  test(`should export the span from`, async () => {
    const filePath = join(__dirname, 'samples', 'request.axios.json');
    const rawData = readFileSync(filePath, 'utf-8');
    const parsedData = JSON.parse(rawData) as SpanData[];

    const result: ExportResult = await new Promise((resolve) => {
      exporter.export(
        parsedData.map((span) => new WrappedReadableSpan(span)),
        resolve,
      );
    });

    expect(result.code).toBe(1);
  });
});
