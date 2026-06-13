import { XrayTraceDataSegmentDocument } from '../xray.document.js';

export interface SegmentEmitter {
  emit(trace: XrayTraceDataSegmentDocument[]): Promise<void>;

  shutdown(): void;
}
