import request from 'supertest';
import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import os from 'os';
import * as fs from 'fs';
import crypto from 'crypto';

describe('distributed.tracing test', () => {
  let clientProcess: ChildProcess;
  let serverProcess: ChildProcess;
  const tracesDir = fs.mkdtempSync(path.join(os.tmpdir(), 'traces-'));
  const genTraceId = () => crypto.randomBytes(16).toString('hex');
  const genSpanId = () => crypto.randomBytes(8).toString('hex');

  beforeAll((done) => {
    const serverPath = path.resolve(__dirname, './app/app.ts');
    clientProcess = spawn('npx', ['ts-node', serverPath], {
      env: {
        ...process.env,
        SERVICE_NAME: 'clnt',
        PORT: '3888',
        TRACES_DIR: tracesDir,
      },
    });

    clientProcess.stdout?.pipe(process.stdout);
    clientProcess.stderr?.pipe(process.stderr);

    clientProcess.stdout?.on('data', (data) => {
      if (data.toString().includes('Server is running')) {
        done();
      }
    });

    clientProcess.on('error', (error) => {
      done(error);
    });

    serverProcess = spawn('npx', ['ts-node', serverPath], {
      env: {
        ...process.env,
        SERVICE_NAME: 'srvr',
        PORT: '4888',
        TRACES_DIR: tracesDir,
      },
    });

    serverProcess.stdout?.pipe(process.stdout);
    serverProcess.stderr?.pipe(process.stderr);

    serverProcess.stdout?.on('data', (data) => {
      if (data.toString().includes('Server is running')) {
        done();
      }
    });

    serverProcess.on('error', (error) => {
      done(error);
    });
  });

  beforeEach(async () => {
    await new Promise((f) => setTimeout(f, 1000));
  });

  afterAll((done) => {
    if (clientProcess) {
      clientProcess.kill('SIGINT');
    }

    if (serverProcess) {
      serverProcess.kill('SIGINT');
    }
    done();
  });

  it('should show the correct segments when for distributed traces', async () => {
    const traceId = genTraceId();
    await request('http://localhost:3888/crossapp/send')
      .get('/')
      .set('traceparent', `00-${traceId}-${genSpanId()}-01`)
      .expect(200)
      .expect({ ok: true });

    await new Promise((f) => setTimeout(f, 2000));
    const traceFileContent = fs.readFileSync(
      path.join(tracesDir, `${traceId}.json`),
      'utf-8',
    );

    expect(JSON.parse(traceFileContent)).toEqual([
      {
        id: expect.stringMatching(/^[a-f0-9]{16}$/),
        trace_id: traceId,
        name: 'middleware - query',
        start_time: expect.any(Number),
        end_time: expect.any(Number),
        parent_id: expect.stringMatching(/^[a-f0-9]{16}$/),
        aws: {
          xray: {
            sdk: expect.stringMatching(/^nodejs\/\d+\.\d+\.\d+$/),
            sdk_version: expect.stringMatching(/^\d+\.\d+\.\d+$/),
            auto_instrumentation: false,
          },
        },
        service: {
          version: 'unknown',
          runtime: 'nodejs',
          runtime_version: process.version.substring(1),
          name: 'clnt',
        },
        type: 'subsegment',
      },
      {
        id: expect.stringMatching(/^[a-f0-9]{16}$/),
        trace_id: traceId,
        name: 'middleware - expressInit',
        start_time: expect.any(Number),
        end_time: expect.any(Number),
        parent_id: expect.stringMatching(/^[a-f0-9]{16}$/),
        aws: {
          xray: {
            sdk: expect.stringMatching(/^nodejs\/\d+\.\d+\.\d+$/),
            sdk_version: expect.stringMatching(/^\d+\.\d+\.\d+$/),
            auto_instrumentation: false,
          },
        },
        service: {
          version: 'unknown',
          runtime: 'nodejs',
          runtime_version: process.version.substring(1),
          name: 'clnt',
        },
        type: 'subsegment',
      },
      {
        id: expect.stringMatching(/^[a-f0-9]{16}$/),
        trace_id: traceId,
        name: 'request handler - /crossapp/send',
        start_time: expect.any(Number),
        end_time: expect.any(Number),
        parent_id: expect.stringMatching(/^[a-f0-9]{16}$/),
        aws: {
          xray: {
            sdk: expect.stringMatching(/^nodejs\/\d+\.\d+\.\d+$/),
            sdk_version: expect.stringMatching(/^\d+\.\d+\.\d+$/),
            auto_instrumentation: false,
          },
        },
        service: {
          version: 'unknown',
          runtime: 'nodejs',
          runtime_version: process.version.substring(1),
          name: 'clnt',
        },
        type: 'subsegment',
      },
      {
        id: expect.stringMatching(/^[a-f0-9]{16}$/),
        trace_id: traceId,
        name: 'middleware - query',
        start_time: expect.any(Number),
        end_time: expect.any(Number),
        parent_id: expect.stringMatching(/^[a-f0-9]{16}$/),
        aws: {
          xray: {
            sdk: expect.stringMatching(/^nodejs\/\d+\.\d+\.\d+$/),
            sdk_version: expect.stringMatching(/^\d+\.\d+\.\d+$/),
            auto_instrumentation: false,
          },
        },
        service: {
          version: 'unknown',
          runtime: 'nodejs',
          runtime_version: process.version.substring(1),
          name: 'srvr',
        },
        type: 'subsegment',
      },
      {
        id: expect.stringMatching(/^[a-f0-9]{16}$/),
        trace_id: traceId,
        name: 'middleware - expressInit',
        start_time: expect.any(Number),
        end_time: expect.any(Number),
        parent_id: expect.stringMatching(/^[a-f0-9]{16}$/),
        aws: {
          xray: {
            sdk: expect.stringMatching(/^nodejs\/\d+\.\d+\.\d+$/),
            sdk_version: expect.stringMatching(/^\d+\.\d+\.\d+$/),
            auto_instrumentation: false,
          },
        },
        service: {
          version: 'unknown',
          runtime: 'nodejs',
          runtime_version: process.version.substring(1),
          name: 'srvr',
        },
        type: 'subsegment',
      },
      {
        id: expect.stringMatching(/^[a-f0-9]{16}$/),
        trace_id: traceId,
        name: 'request handler - /crossapp/receive',
        start_time: expect.any(Number),
        end_time: expect.any(Number),
        parent_id: expect.stringMatching(/^[a-f0-9]{16}$/),
        aws: {
          xray: {
            sdk: expect.stringMatching(/^nodejs\/\d+\.\d+\.\d+$/),
            sdk_version: expect.stringMatching(/^\d+\.\d+\.\d+$/),
            auto_instrumentation: false,
          },
        },
        service: {
          version: 'unknown',
          runtime: 'nodejs',
          runtime_version: process.version.substring(1),
          name: 'srvr',
        },
        type: 'subsegment',
      },
      {
        id: expect.stringMatching(/^[a-f0-9]{16}$/),
        trace_id: traceId,
        name: 'POST /crossapp/receive',
        start_time: expect.any(Number),
        end_time: expect.any(Number),
        parent_id: expect.stringMatching(/^[a-f0-9]{16}$/),
        http: {
          request: {
            method: 'POST',
            client_ip: '::1',
            user_agent: 'axios/1.7.7',
            x_forwarded_for: true,
            url: 'http://localhost:4888/crossapp/receive',
          },
          response: {
            status: 200,
          },
        },
        aws: {
          xray: {
            sdk: expect.stringMatching(/^nodejs\/\d+\.\d+\.\d+$/),
            sdk_version: expect.stringMatching(/^\d+\.\d+\.\d+$/),
            auto_instrumentation: false,
          },
        },
        service: {
          version: 'unknown',
          runtime: 'nodejs',
          runtime_version: process.version.substring(1),
          name: 'srvr',
        },
      },
      {
        id: expect.stringMatching(/^[a-f0-9]{16}$/),
        trace_id: traceId,
        name: 'POST',
        start_time: expect.any(Number),
        end_time: expect.any(Number),
        parent_id: expect.stringMatching(/^[a-f0-9]{16}$/),
        namespace: 'remote',
        http: {
          request: {
            method: 'POST',
            client_ip: '::1',
            x_forwarded_for: true,
            url: 'http://localhost:4888/crossapp/receive',
          },
          response: {
            status: 200,
          },
        },
        aws: {
          xray: {
            sdk: expect.stringMatching(/^nodejs\/\d+\.\d+\.\d+$/),
            sdk_version: expect.stringMatching(/^\d+\.\d+\.\d+$/),
            auto_instrumentation: false,
          },
        },
        service: {
          version: 'unknown',
          runtime: 'nodejs',
          runtime_version: process.version.substring(1),
          name: 'clnt',
        },
        type: 'subsegment',
      },
      {
        id: expect.stringMatching(/^[a-f0-9]{16}$/),
        trace_id: traceId,
        name: 'GET /crossapp/send',
        start_time: expect.any(Number),
        end_time: expect.any(Number),
        parent_id: expect.stringMatching(/^[a-f0-9]{16}$/),
        http: {
          request: {
            method: 'GET',
            client_ip: '::1',
            x_forwarded_for: true,
            url: 'http://localhost:3888/crossapp/send/',
          },
          response: {
            status: 200,
          },
        },
        aws: {
          xray: {
            sdk: expect.stringMatching(/^nodejs\/\d+\.\d+\.\d+$/),
            sdk_version: expect.stringMatching(/^\d+\.\d+\.\d+$/),
            auto_instrumentation: false,
          },
        },
        service: {
          version: 'unknown',
          runtime: 'nodejs',
          runtime_version: process.version.substring(1),
          name: 'clnt',
        },
      },
    ]);
  });
});
