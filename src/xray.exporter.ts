/**
 * Exports OpenTelemetry spans to AWS X-Ray as trace segment documents.
 * @file
 */
import { diag } from '@opentelemetry/api';
import { ExportResultCode } from '@opentelemetry/core';
import { emptyDeep } from 'empty-deep';
import { DefaultCauseParser } from './cause.parser.js';
import { SDKBasedSegmentEmitter } from './emitter/sdk.emitter.js';
import { UDPDaemonSegmentEmitter } from './emitter/udp.emitter.js';
import { DefaultHttpParser } from './http.parser.js';
import { DefaultIdParser } from './id.parser.js';
import { DefaultNameParser } from './name.parser.js';
import { DefaultOriginParser } from './origin.parser.js';
import { EnhancedReadableSpan } from './super.span.js';
import { DefaultTraceFilter } from './trace.filter.js';
import type { TraceFilter } from './trace.filter.js';
import type { OriginParser } from './origin.parser.js';
import type { NameParser } from './name.parser.js';
import type { IdParser } from './id.parser.js';
import type { HttpParser } from './http.parser.js';
import type { SegmentEmitter } from './emitter/segment.emitter.js';
import type { CauseParser } from './cause.parser.js';
import type { ReadableSpan, SpanExporter } from '@opentelemetry/sdk-trace-base';
import type { ExportResult } from '@opentelemetry/core';
import type { XrayTraceDataSegmentDocument } from './xray.document.js';

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
      .values()
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
      .filter((segment) => this.traceFilter.doFilter(segment))
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- emptyDeep is typed as Partial<T> | undefined, but it only strips empty values from a complete document; accepting partial documents in SegmentEmitter would change that public interface
      .map((segment) => emptyDeep(segment) as XrayTraceDataSegmentDocument)
      .toArray();

    // eslint-disable-next-line functional/no-loop-statements -- each emitter is started in registration order
    for (const segmentEmitter of this.segmentEmitters) {
      void this.emitTo(segmentEmitter, trace, spans.length, resultCallback);
    }
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
      diag.debug(`Sent ${spanCount} spans to X-Ray.`);
      resultCallback({ code: ExportResultCode.SUCCESS });
    } catch (error) {
      diag.warn(`Encountered an error when sending the spans to X-Ray.`);
      resultCallback({
        code: ExportResultCode.FAILED,
        error: error instanceof Error ? error : new Error(String(error)),
      });
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
  async shutdown(): Promise<void> {
    // No implementation for shutdown logic since there's no cleanup needed.
    // eslint-disable-next-line functional/no-loop-statements -- every emitter is shut down for its side effect
    for (const segmentEmitter of this.segmentEmitters) {
      segmentEmitter.shutdown();
    }
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
