import { XrayTraceDataSegmentDocument } from '../xray.document';

export interface SegmentEmitter {
  emit(trace: XrayTraceDataSegmentDocument[]): Promise<void>;

  shutdown(): void;
}
