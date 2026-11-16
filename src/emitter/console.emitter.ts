/**
 * Writes X-Ray trace segments to the console as formatted JSON.
 * @file
 */

import type { SegmentEmitter } from './segment.emitter.js';
import type { XrayTraceDataSegmentDocument } from '../xray.document.js';

// noinspection JSUnusedGlobalSymbols
export class ConsoleEmitter implements SegmentEmitter {
  shutdown() {
    //
  }

  async emit(trace: XrayTraceDataSegmentDocument[]): Promise<void> {
    console.log(JSON.stringify(trace, null, 2));
  }
}
