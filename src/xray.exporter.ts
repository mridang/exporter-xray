import { SpanExporter } from '@opentelemetry/sdk-trace-base/build/src/export/SpanExporter';
import { PutTraceSegmentsCommand, XRayClient } from '@aws-sdk/client-xray';
import { XrayTraceDataSegmentDocument } from './xray.document';
import { ReadableSpan } from '@opentelemetry/sdk-trace-base/build/src/export/ReadableSpan';
import { EnhancedReadableSpan } from './super.span';
import { ExportResult, ExportResultCode } from '@opentelemetry/core';
import { DefaultIdParser, IdParser } from './id.parser';
import { DefaultCauseParser, CauseParser } from './cause.parser';
import { DefaultHttpParser, HttpParser } from './http.parser';
import { diag } from '@opentelemetry/api';
import { DefaultNameParser, NameParser } from './name.parser';

export default class XraySpanExporter implements SpanExporter {
  constructor(
    private readonly xRayClient: XRayClient = new XRayClient(),
    private readonly idParser: IdParser = new DefaultIdParser(),
    private readonly causeParser: CauseParser = new DefaultCauseParser(),
    private readonly httpParser: HttpParser = new DefaultHttpParser(),
    private readonly nameParser: NameParser = new DefaultNameParser(),
  ) {
    //
  }

  export(spans: ReadableSpan[], cb: (result: ExportResult) => void) {
    const trace: XrayTraceDataSegmentDocument[] = spans
      .map((span) => new EnhancedReadableSpan(span))
      .map(
        (span): XrayTraceDataSegmentDocument => ({
          id: span.getSpanId(),
          trace_id: span.getTraceId(this.idParser),
          name: span.getName(this.nameParser),
          start_time: span.getStartTime(),
          end_time: span.getEndTime(),
          parent_id: span.getParentId(),
          fault: span.isFault(),
          error: span.isError(),
          throttle: span.isThrottled(),
          cause: span.getCause(this.causeParser),
          origin: span.getOrigin(),
          namespace: span.getNamespace(),
          user: span.getUser(),
          http: span.getHttp(this.httpParser),
          aws: span.getAWS(),
          service: span.getService(),
          sql: span.getSql(),
          //Annotations: annotations,
          //Metadata:    metadata,
          type: span.getType(),
          links: span.getLinks(this.idParser),
        }),
      );

    this.xRayClient
      .send(
        new PutTraceSegmentsCommand({
          TraceSegmentDocuments: trace.map((document) =>
            JSON.stringify(document),
          ),
        }),
      )
      .then((result) => {
        diag.debug(`Sent ${spans.length} spans to X-Ray.`);
        if (result.UnprocessedTraceSegments?.length) {
          const upCnt = result.UnprocessedTraceSegments?.length || 0;
          diag.warn(`${upCnt} couldn't be processed.`);
        }
        cb({ code: ExportResultCode.SUCCESS });
      })
      .catch((err) => {
        cb({ code: ExportResultCode.FAILED, error: err as Error });
      });
  }

  /**
   * Shuts down the exporter.
   * This method currently destroys the X-Ray client instance.
   * @returns A promise that resolves immediately.
   */
  shutdown(): Promise<void> {
    // No implementation for shutdown logic since there's no cleanup needed.
    this.xRayClient.destroy();
    return Promise.resolve();
  }

  /**
   * Forces the exporter to flush any pending exports.
   * This method is currently a no-op.
   * @returns A promise that resolves immediately.
   */
  forceFlush?(): Promise<void> {
    // No implementation for forceFlush since it's not needed for X-Ray export.
    return Promise.resolve();
  }
}
