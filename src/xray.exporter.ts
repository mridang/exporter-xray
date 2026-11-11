/**
 * Exports OpenTelemetry spans to AWS X-Ray as trace segment documents.
 * @file
 */
import { diag } from '@opentelemetry/api';
import { ExportResult, ExportResultCode } from '@opentelemetry/core';
import { ReadableSpan, SpanExporter } from '@opentelemetry/sdk-trace-base';
import { emptyDeep } from 'empty-deep';
import { CauseParser, DefaultCauseParser } from './cause.parser.js';
import { SDKBasedSegmentEmitter } from './emitter/sdk.emitter.js';
import { SegmentEmitter } from './emitter/segment.emitter.js';
import { UDPDaemonSegmentEmitter } from './emitter/udp.emitter.js';
import { DefaultHttpParser, HttpParser } from './http.parser.js';
import { DefaultIdParser, IdParser } from './id.parser.js';
import { DefaultNameParser, NameParser } from './name.parser.js';
import { DefaultOriginParser, OriginParser } from './origin.parser.js';
import { EnhancedReadableSpan } from './super.span.js';
import { DefaultTraceFilter, TraceFilter } from './trace.filter.js';
import { XrayTraceDataSegmentDocument } from './xray.document.js';

/**
 * Creates an instance of XraySpanExporter.
 * @param [segmentEmitters] - The emitters used to send
 * segments to AWS X-Ray.
 * @param [idParser] - The parser used for converting OpenTelemetry
 * trace IDs to AWS X-Ray trace IDs.
 * @param [causeParser] - The parser used for extracting error
 * causes from spans.
 * @param [httpParser] - The parser used for extracting HTTP
 * details from spans.
 * @param [nameParser] - The parser used for determining the name
 * of the segment.
 * @param [originParser] - The parser used for determining the
 * origin of the segment.
 * @param [traceFilter] - The filter used to determine if a trace
 * should be sent to X-Ray.
 * @param [indexedAttributes] - The attributes to index in the X-Ray
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

  /**
   * Converts the spans into X-Ray segments and sends them through every emitter.
   * @param spans - The OpenTelemetry spans to export.
   * @param resultCallback - Called once per emitter with the outcome of its send.
   * @example
   * ```ts
   * exporter.export(spans, (result) => {
   *   if (result.code === ExportResultCode.SUCCESS) {
   *     diag.debug('Spans exported.');
   *   }
   * });
   * ```
   */
  export(
    spans: ReadableSpan[],
    resultCallback: (result: ExportResult) => void,
  ) {
    const trace: XrayTraceDataSegmentDocument[] = spans
      .map((span) => new EnhancedReadableSpan(span))
      .map((span): XrayTraceDataSegmentDocument => ({
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
      }))
      .filter((trace) => {
        return this.traceFilter.doFilter(trace);
      })
      .map((trace) => {
        return emptyDeep(trace) as XrayTraceDataSegmentDocument;
      });

    this.segmentEmitters.forEach((segmentEmitter) =>
      this.emitTo(segmentEmitter, trace, spans.length, resultCallback),
    );
  }

  /**
   * Sends the trace segments through one emitter and reports the outcome.
   * @param segmentEmitter - The emitter that sends the segments.
   * @param trace - The segment documents to send.
   * @param spanCount - The number of spans in the export, used for logging.
   * @param resultCallback - Called with the success or failure of the send.
   * @example
   * ```ts
   * await this.emitTo(new ConsoleEmitter(), trace, trace.length, (result) => {});
   * ```
   */
  private async emitTo(
    segmentEmitter: SegmentEmitter,
    trace: XrayTraceDataSegmentDocument[],
    spanCount: number,
    resultCallback: (result: ExportResult) => void,
  ): Promise<void> {
    try {
      await segmentEmitter.emit(trace);
      // eslint-disable-next-line testing-library/no-debugging-utils -- diag is the OpenTelemetry logger, not a testing helper
      diag.debug(`Sent ${spanCount} spans to X-Ray.`);
      resultCallback({ code: ExportResultCode.SUCCESS });
    } catch (error) {
      diag.warn(`Encountered an error when sending the spans to X-Ray.`);
      resultCallback({ code: ExportResultCode.FAILED, error: error as Error });
    }
  }

  /**
   * Shuts down the exporter.
   * This method currently destroys the X-Ray client instance.
   * @returns A promise that resolves immediately.
   * @example
   * ```ts
   * await exporter.shutdown();
   * ```
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
   * @example
   * ```ts
   * await exporter.forceFlush();
   * ```
   */
  forceFlush?(): Promise<void> {
    // No implementation for forceFlush since it's not needed for X-Ray export.
    return Promise.resolve();
  }
}
