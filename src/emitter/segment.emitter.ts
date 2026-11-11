/**
 * Defines the contract for components that emit X-Ray trace segments.
 * @file
 */

import { XrayTraceDataSegmentDocument } from '../xray.document.js';

export interface SegmentEmitter {
  emit(trace: XrayTraceDataSegmentDocument[]): Promise<void>;

  shutdown(): void;
}
