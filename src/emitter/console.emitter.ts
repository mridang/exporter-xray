import { SegmentEmitter } from './segment.emitter.js';
import { XrayTraceDataSegmentDocument } from '../xray.document.js';

// noinspection JSUnusedGlobalSymbols
export class ConsoleEmitter implements SegmentEmitter {
  constructor() {
    //
  }

  shutdown() {
    //
  }

  async emit(trace: XrayTraceDataSegmentDocument[]): Promise<void> {
    console.log(JSON.stringify(trace, null, 2));
  }
}
