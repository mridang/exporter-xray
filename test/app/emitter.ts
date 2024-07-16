import * as fs from 'fs';
import path from 'path';
import { XrayTraceDataSegmentDocument, SegmentEmitter } from '../../src';
import { diag } from '@opentelemetry/api';

export default class TempFileEmitter implements SegmentEmitter {
  constructor(
    private readonly tempDir: string = process.env.TRACES_DIR || '.',
  ) {
    diag.info(`Writing segements to ${tempDir}`);
  }

  shutdown() {
    //
  }

  async emit(trace: XrayTraceDataSegmentDocument[]): Promise<void> {
    try {
      for (const document of trace) {
        const traceId = document.trace_id;
        const filePath = path.join(this.tempDir, `${traceId}.json`);

        let traceArray: XrayTraceDataSegmentDocument[] = [];
        if (fs.existsSync(filePath)) {
          const fileContent = fs.readFileSync(filePath, 'utf-8');
          traceArray = JSON.parse(
            fileContent,
          ) as XrayTraceDataSegmentDocument[];
        }

        traceArray.push(document);

        console.log('Saving to ' + filePath);
        fs.writeFileSync(
          filePath,
          JSON.stringify(traceArray, null, 2),
          'utf-8',
        );
      }
    } catch (error) {
      diag.error('Error writing trace segments to files', error);
    }
  }
}
