import { SegmentEmitter } from './segment.emitter';
import { PutTraceSegmentsCommand, XRayClient } from '@aws-sdk/client-xray';
import { XrayTraceDataSegmentDocument } from '../xray.document';
import { diag } from '@opentelemetry/api';

export class SDKBasedSegmentEmitter implements SegmentEmitter {
  constructor(private readonly xRayClient: XRayClient = new XRayClient()) {
    //
  }

  shutdown() {
    this.xRayClient.destroy();
  }

  async emit(trace: XrayTraceDataSegmentDocument[]): Promise<void> {
    trace[0].id;
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
