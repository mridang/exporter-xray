/**
 * Decides which X-Ray trace segments should be exported.
 * @file
 */

import type { XrayTraceDataSegmentDocument } from './xray.document.js';

export interface TraceFilter {
  doFilter(span: XrayTraceDataSegmentDocument): boolean;
}

export class DefaultTraceFilter implements TraceFilter {
  doFilter(trace: XrayTraceDataSegmentDocument): boolean {
    return !trace.http?.request?.user_agent?.includes('aws-sdk-js');
  }
}
