import { diag } from '@opentelemetry/api';
import { ExportResult, ExportResultCode } from '@opentelemetry/core';
import { ReadableSpan, SpanExporter } from '@opentelemetry/sdk-trace-base';
import { emptyDeep } from 'empty-deep';
import { CauseParser, DefaultCauseParser } from './cause.parser';
import { SDKBasedSegmentEmitter } from './emitter/sdk.emitter';
import { SegmentEmitter } from './emitter/segment.emitter';
import { UDPDaemonSegmentEmitter } from './emitter/udp.emitter';
import { DefaultHttpParser, HttpParser } from './http.parser';
import { DefaultIdParser, IdParser } from './id.parser';
import { DefaultNameParser, NameParser } from './name.parser';
import { DefaultOriginParser, OriginParser } from './origin.parser';
import { EnhancedReadableSpan } from './super.span';
import { DefaultTraceFilter, TraceFilter } from './trace.filter';
import { XrayTraceDataSegmentDocument } from './xray.document';

/**
 * Creates an instance of XraySpanExporter.
 * @param {SegmentEmitter[]} [segmentEmitters] - The emitters used to send
 * segments to AWS X-Ray.
 * @param {IdParser} [idParser] - The parser used for converting OpenTelemetry
 * trace IDs to AWS X-Ray trace IDs.
 * @param {CauseParser} [causeParser] - The parser used for extracting error
 * causes from spans.
 * @param {HttpParser} [httpParser] - The parser used for extracting HTTP
 * details from spans.
 * @param {NameParser} [nameParser] - The parser used for determining the name
 * of the segment.
 * @param {OriginParser} [originParser] - The parser used for determining the
 * origin of the segment.
 * @param {TraceFilter} [traceFilter] - The filter used to determine if a trace
 * should be sent to X-Ray.
 * @param {string[]} [indexedAttributes] - The attributes to index in the X-Ray
 * console as annotations.
 */
export default class XraySpanExporter implements SpanExporter {
  constructor(
    private readonly segmentEmitters: SegmentEmitter[] = [
      process.env.AWS_LAMBDA_FUNCTION_NAME
        ? new UDPDaemonSegmentEmitter()
        : new SDKBasedSegmentEmitter(),
    ],
    private readonly idParser: IdParser = new DefaultIdParser(),
    private readonly causeParser: CauseParser = new DefaultCauseParser(),
    private readonly httpParser: HttpParser = new DefaultHttpParser(),
    private readonly nameParser: NameParser = new DefaultNameParser(),
    private readonly originParser: OriginParser = new DefaultOriginParser(),
    private readonly traceFilter: TraceFilter = new DefaultTraceFilter(),
    private readonly indexedAttributes: string[] = [],
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
          origin: span.getOrigin(this.originParser),
          namespace: span.getNamespace(),
          user: span.getUser(),
          http: span.getHttp(this.httpParser),
          aws: span.getAWS(),
          service: span.getService(),
          sql: span.getSql(),
          annotations: span.getAnnotations(this.indexedAttributes),
          metadata: span.getMetadata(),
          type: span.getType(),
          links: span.getLinks(this.idParser),
        }),
      )
      .filter((trace) => {
        return this.traceFilter.doFilter(trace);
      })
      .map((trace) => {
        return emptyDeep(trace) as XrayTraceDataSegmentDocument;
      });

    this.segmentEmitters.forEach((segmentEmitter) =>
      segmentEmitter
        .emit(trace)
        .then(() => {
          // eslint-disable-next-line testing-library/no-debugging-utils
          diag.debug(`Sent ${spans.length} spans to X-Ray.`);
          cb({ code: ExportResultCode.SUCCESS });
        })
        .catch((err) => {
          diag.warn(`Encountered an error when sending the spans to X-Ray.`);
          cb({ code: ExportResultCode.FAILED, error: err });
        }),
    );
  }

  /**
   * Shuts down the exporter.
   * This method currently destroys the X-Ray client instance.
   * @returns A promise that resolves immediately.
   */
  shutdown(): Promise<void> {
    // No implementation for shutdown logic since there's no cleanup needed.
    this.segmentEmitters.forEach((segmentEmitter) => segmentEmitter.shutdown());
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
