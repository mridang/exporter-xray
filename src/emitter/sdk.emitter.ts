/**
 * Sends X-Ray trace segments through the AWS X-Ray SDK client.
 * @file
 */

import { PutTraceSegmentsCommand, XRayClient } from '@aws-sdk/client-xray';
import { diag } from '@opentelemetry/api';
import type { SegmentEmitter } from './segment.emitter.js';
import type { XrayTraceDataSegmentDocument } from '../xray.document.js';

export class SDKBasedSegmentEmitter implements SegmentEmitter {
  constructor(private readonly xRayClient: XRayClient = new XRayClient()) {
    //
  }

  shutdown() {
    this.xRayClient.destroy();
  }

  async emit(trace: XrayTraceDataSegmentDocument[]): Promise<void> {
    const result = await this.xRayClient.send(
      new PutTraceSegmentsCommand({
        TraceSegmentDocuments: trace.map((document) =>
          JSON.stringify(document),
        ),
      }),
    );

    if (result.UnprocessedTraceSegments?.length) {
      const upCnt = result.UnprocessedTraceSegments.length || 0;
      diag.warn(`${upCnt} couldn't be processed.`);
    }
  }
}
