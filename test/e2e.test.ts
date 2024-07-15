import request from 'supertest';
import { spawn, ChildProcess, execSync } from 'child_process';
import path from 'path';
import os from 'os';
import * as fs from 'fs';
import crypto from 'crypto';

describe('sample.application test', () => {
  let serverProcess: ChildProcess;
  const tracesDir = fs.mkdtempSync(path.join(os.tmpdir(), 'traces-'));
  const genTraceId = () => crypto.randomBytes(16).toString('hex');
  const genSpanId = () => crypto.randomBytes(8).toString('hex');

  beforeAll((done) => {
    const serverPath = path.resolve(__dirname, './app/app.ts');
    serverProcess = spawn('npx', ['ts-node', serverPath], {
      env: {
        ...process.env,
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

  afterAll((done) => {
    if (serverProcess) {
      serverProcess.kill();
    }
    done();
  });

  it('should show the correct segments when using fetch', async () => {
    const traceId = genTraceId();
    await request('http://localhost:2999/http/fetch')
      .get('/')
      .set('traceparent', `00-${traceId}-${genSpanId()}-01`)
      .expect(200);

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
          name: 'test',
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
          name: 'test',
        },
        type: 'subsegment',
      },
      {
        id: expect.stringMatching(/^[a-f0-9]{16}$/),
        trace_id: traceId,
        name: 'router - /http',
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
          name: 'test',
        },
        type: 'subsegment',
      },
      {
        id: expect.stringMatching(/^[a-f0-9]{16}$/),
        trace_id: traceId,
        name: 'request handler - /fetch',
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
          name: 'test',
        },
        type: 'subsegment',
      },
      {
        id: expect.stringMatching(/^[a-f0-9]{16}$/),
        trace_id: traceId,
        name: 'GET',
        start_time: expect.any(Number),
        end_time: expect.any(Number),
        parent_id: expect.stringMatching(/^[a-f0-9]{16}$/),
        namespace: 'remote',
        http: {
          request: {
            method: 'GET',
            client_ip: expect.stringMatching(
              /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/,
            ),
            user_agent: 'node',
            url: 'https://api.github.com/',
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
          name: 'test',
        },
        type: 'subsegment',
      },
      {
        id: expect.stringMatching(/^[a-f0-9]{16}$/),
        trace_id: traceId,
        name: 'GET /http/fetch',
        start_time: expect.any(Number),
        end_time: expect.any(Number),
        parent_id: expect.stringMatching(/^[a-f0-9]{16}$/),
        http: {
          request: {
            method: 'GET',
            client_ip: '::1',
            x_forwarded_for: true,
            url: 'http://localhost:2999/http/fetch/',
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
          name: 'test',
        },
      },
    ]);
  });

  it('should show the correct segments when using DynamoDB', async () => {
    await new Promise((f) => setTimeout(f, 2000));

    const traceId = genTraceId();
    await request('http://localhost:2999/dynamo/add-to-table')
      .get('/')
      .set('traceparent', `00-${traceId}-${genSpanId()}-01`)
      .expect(200);

    await new Promise((f) => setTimeout(f, 2500));
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
          name: 'test',
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
          name: 'test',
        },
        type: 'subsegment',
      },
      {
        id: expect.stringMatching(/^[a-f0-9]{16}$/),
        trace_id: traceId,
        name: 'router - /dynamo',
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
          name: 'test',
        },
        type: 'subsegment',
      },
      {
        id: expect.stringMatching(/^[a-f0-9]{16}$/),
        trace_id: traceId,
        name: 'request handler - /add-to-table',
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
          name: 'test',
        },
        type: 'subsegment',
      },
      {
        id: expect.stringMatching(/^[a-f0-9]{16}$/),
        trace_id: traceId,
        name: 'GET /dynamo/add-to-table',
        start_time: expect.any(Number),
        end_time: expect.any(Number),
        parent_id: expect.stringMatching(/^[a-f0-9]{16}$/),
        http: {
          request: {
            method: 'GET',
            client_ip: '::1',
            x_forwarded_for: true,
            url: 'http://localhost:2999/dynamo/add-to-table/',
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
          name: 'test',
        },
      },
    ]);
  });

  it('should show the correct segments when using SQS', async () => {
    const traceId = genTraceId();
    await request('http://localhost:2999/sqs/add-to-queue')
      .get('/')
      .set('traceparent', `00-${traceId}-${genSpanId()}-01`)
      .expect(200);

    await new Promise((f) => setTimeout(f, 2500));
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
          name: 'test',
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
          name: 'test',
        },
        type: 'subsegment',
      },
      {
        id: expect.stringMatching(/^[a-f0-9]{16}$/),
        trace_id: traceId,
        name: 'router - /sqs',
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
          name: 'test',
        },
        type: 'subsegment',
      },
      {
        id: expect.stringMatching(/^[a-f0-9]{16}$/),
        trace_id: traceId,
        name: 'request handler - /add-to-queue',
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
          name: 'test',
        },
        type: 'subsegment',
      },
      {
        id: expect.stringMatching(/^[a-f0-9]{16}$/),
        trace_id: traceId,
        name: 'GET /sqs/add-to-queue',
        start_time: expect.any(Number),
        end_time: expect.any(Number),
        parent_id: expect.stringMatching(/^[a-f0-9]{16}$/),
        http: {
          request: {
            method: 'GET',
            client_ip: '::1',
            x_forwarded_for: true,
            url: 'http://localhost:2999/sqs/add-to-queue/',
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
          name: 'test',
        },
      },
    ]);
  });

  it('should show the correct segments when using SSM', async () => {
    const traceId = genTraceId();
    await request('http://localhost:2999/ssm/get-secret')
      .get('/')
      .set('traceparent', `00-${traceId}-${genSpanId()}-01`)
      .expect(200);

    await new Promise((f) => setTimeout(f, 2500));
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
          name: 'test',
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
          name: 'test',
        },
        type: 'subsegment',
      },
      {
        id: expect.stringMatching(/^[a-f0-9]{16}$/),
        trace_id: traceId,
        name: 'router - /ssm',
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
          name: 'test',
        },
        type: 'subsegment',
      },
      {
        id: expect.stringMatching(/^[a-f0-9]{16}$/),
        trace_id: traceId,
        name: 'request handler - /get-secret',
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
          name: 'test',
        },
        type: 'subsegment',
      },
      {
        id: expect.stringMatching(/^[a-f0-9]{16}$/),
        trace_id: traceId,
        name: 'GET /ssm/get-secret',
        start_time: expect.any(Number),
        end_time: expect.any(Number),
        parent_id: expect.stringMatching(/^[a-f0-9]{16}$/),
        http: {
          request: {
            method: 'GET',
            client_ip: '::1',
            x_forwarded_for: true,
            url: 'http://localhost:2999/ssm/get-secret/',
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
          name: 'test',
        },
      },
    ]);
  });

  it('should show the correct segments when using S3', async () => {
    const traceId = genTraceId();
    await request('http://localhost:2999/s3/add-to-bucket')
      .get('/')
      .set('traceparent', `00-${traceId}-${genSpanId()}-01`)
      .expect(200);

    await new Promise((f) => setTimeout(f, 2500));
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
          name: 'test',
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
          name: 'test',
        },
        type: 'subsegment',
      },
      {
        id: expect.stringMatching(/^[a-f0-9]{16}$/),
        trace_id: traceId,
        name: 'router - /s3',
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
          name: 'test',
        },
        type: 'subsegment',
      },
      {
        id: expect.stringMatching(/^[a-f0-9]{16}$/),
        trace_id: traceId,
        name: 'request handler - /add-to-bucket',
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
          name: 'test',
        },
        type: 'subsegment',
      },
      {
        id: expect.stringMatching(/^[a-f0-9]{16}$/),
        trace_id: traceId,
        name: 'GET /s3/add-to-bucket',
        start_time: expect.any(Number),
        end_time: expect.any(Number),
        parent_id: expect.stringMatching(/^[a-f0-9]{16}$/),
        http: {
          request: {
            method: 'GET',
            client_ip: '::1',
            x_forwarded_for: true,
            url: 'http://localhost:2999/s3/add-to-bucket/',
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
          name: 'test',
        },
      },
    ]);
  });

  it('should show the correct segments when using axios', async () => {
    const traceId = genTraceId();
    await request('http://localhost:2999/http/axios')
      .get('/')
      .set('traceparent', `00-${traceId}-${genSpanId()}-01`)
      .expect(200);

    await new Promise((f) => setTimeout(f, 2500));
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
          name: 'test',
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
          name: 'test',
        },
        type: 'subsegment',
      },
      {
        id: expect.stringMatching(/^[a-f0-9]{16}$/),
        trace_id: traceId,
        name: 'router - /http',
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
          name: 'test',
        },
        type: 'subsegment',
      },
      {
        id: expect.stringMatching(/^[a-f0-9]{16}$/),
        trace_id: traceId,
        name: 'request handler - /axios',
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
          name: 'test',
        },
        type: 'subsegment',
      },
      {
        id: expect.stringMatching(/^[a-f0-9]{16}$/),
        trace_id: traceId,
        name: 'GET',
        start_time: expect.any(Number),
        end_time: expect.any(Number),
        parent_id: expect.stringMatching(/^[a-f0-9]{16}$/),
        namespace: 'remote',
        http: {
          request: {
            method: 'GET',
            client_ip: expect.stringMatching(
              /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/,
            ),
            x_forwarded_for: true,
            url: 'https://api.github.com/',
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
          name: 'test',
        },
        type: 'subsegment',
      },
      {
        id: expect.stringMatching(/^[a-f0-9]{16}$/),
        trace_id: traceId,
        name: 'GET /http/axios',
        start_time: expect.any(Number),
        end_time: expect.any(Number),
        parent_id: expect.stringMatching(/^[a-f0-9]{16}$/),
        http: {
          request: {
            method: 'GET',
            client_ip: '::1',
            x_forwarded_for: true,
            url: 'http://localhost:2999/http/axios/',
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
          name: 'test',
        },
      },
    ]);
  });

  it('should show the correct segments when using MySQL', async () => {
    const traceId = genTraceId();
    await request('http://localhost:2999/mysql/count')
      .get('/')
      .set('traceparent', `00-${traceId}-${genSpanId()}-01`)
      .expect(200);

    await new Promise((f) => setTimeout(f, 2500));
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
          name: 'test',
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
          name: 'test',
        },
        type: 'subsegment',
      },
      {
        id: expect.stringMatching(/^[a-f0-9]{16}$/),
        trace_id: traceId,
        name: 'router - /mysql',
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
          name: 'test',
        },
        type: 'subsegment',
      },
      {
        id: expect.stringMatching(/^[a-f0-9]{16}$/),
        trace_id: traceId,
        name: 'request handler - /count',
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
          name: 'test',
        },
        type: 'subsegment',
      },
      {
        id: expect.stringMatching(/^[a-f0-9]{16}$/),
        trace_id: traceId,
        name: 'SELECT',
        start_time: expect.any(Number),
        end_time: expect.any(Number),
        parent_id: expect.stringMatching(/^[a-f0-9]{16}$/),
        namespace: 'remote',
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
          name: 'test',
        },
        sql: {
          url: 'SELECT',
          connection_string:
            'jdbc:mysql://localhost:3306/your_database/your_database',
          database_type: 'mysql',
          user: 'your_user',
          sanitized_query: 'SELECT 1',
        },
        type: 'subsegment',
      },
      {
        id: expect.stringMatching(/^[a-f0-9]{16}$/),
        trace_id: traceId,
        name: 'GET /mysql/count',
        start_time: expect.any(Number),
        end_time: expect.any(Number),
        parent_id: expect.stringMatching(/^[a-f0-9]{16}$/),
        http: {
          request: {
            method: 'GET',
            client_ip: '::1',
            x_forwarded_for: true,
            url: 'http://localhost:2999/mysql/count/',
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
          name: 'test',
        },
      },
    ]);
  });

  it('should show the correct segments when there are errors', async () => {
    const traceId = genTraceId();
    await request('http://localhost:2999/cause/error')
      .get('/')
      .set('traceparent', `00-${traceId}-${genSpanId()}-01`)
      .expect(400);

    await new Promise((f) => setTimeout(f, 2500));
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
            sdk: 'nodejs/1.25.1',
            sdk_version: '1.25.1',
            auto_instrumentation: false,
          },
        },
        service: {
          version: 'unknown',
          runtime: 'nodejs',
          runtime_version: process.version.substring(1),
          name: 'test',
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
            sdk: 'nodejs/1.25.1',
            sdk_version: '1.25.1',
            auto_instrumentation: false,
          },
        },
        service: {
          version: 'unknown',
          runtime: 'nodejs',
          runtime_version: process.version.substring(1),
          name: 'test',
        },
        type: 'subsegment',
      },
      {
        id: expect.stringMatching(/^[a-f0-9]{16}$/),
        trace_id: traceId,
        name: 'request handler - /cause/error',
        start_time: expect.any(Number),
        end_time: expect.any(Number),
        parent_id: expect.stringMatching(/^[a-f0-9]{16}$/),
        aws: {
          xray: {
            sdk: 'nodejs/1.25.1',
            sdk_version: '1.25.1',
            auto_instrumentation: false,
          },
        },
        service: {
          version: 'unknown',
          runtime: 'nodejs',
          runtime_version: process.version.substring(1),
          name: 'test',
        },
        type: 'subsegment',
      },
      {
        id: expect.stringMatching(/^[a-f0-9]{16}$/),
        trace_id: traceId,
        name: 'GET /cause/error',
        start_time: expect.any(Number),
        end_time: expect.any(Number),
        parent_id: expect.stringMatching(/^[a-f0-9]{16}$/),
        error: true,
        http: {
          request: {
            method: 'GET',
            client_ip: '::1',
            x_forwarded_for: true,
            url: 'http://localhost:2999/cause/error/',
          },
          response: {
            status: 400,
          },
        },
        aws: {
          xray: {
            sdk: 'nodejs/1.25.1',
            sdk_version: '1.25.1',
            auto_instrumentation: false,
          },
        },
        service: {
          version: 'unknown',
          runtime: 'nodejs',
          runtime_version: process.version.substring(1),
          name: 'test',
        },
      },
    ]);
  });

  it('should show the correct segments when there are throttles', async () => {
    const traceId = genTraceId();
    await request('http://localhost:2999/cause/throttle')
      .get('/')
      .set('traceparent', `00-${traceId}-${genSpanId()}-01`)
      .expect(429);

    await new Promise((f) => setTimeout(f, 2500));
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
            sdk: 'nodejs/1.25.1',
            sdk_version: '1.25.1',
            auto_instrumentation: false,
          },
        },
        service: {
          version: 'unknown',
          runtime: 'nodejs',
          runtime_version: process.version.substring(1),
          name: 'test',
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
            sdk: 'nodejs/1.25.1',
            sdk_version: '1.25.1',
            auto_instrumentation: false,
          },
        },
        service: {
          version: 'unknown',
          runtime: 'nodejs',
          runtime_version: process.version.substring(1),
          name: 'test',
        },
        type: 'subsegment',
      },
      {
        id: expect.stringMatching(/^[a-f0-9]{16}$/),
        trace_id: traceId,
        name: 'request handler - /cause/throttle',
        start_time: expect.any(Number),
        end_time: expect.any(Number),
        parent_id: expect.stringMatching(/^[a-f0-9]{16}$/),
        aws: {
          xray: {
            sdk: 'nodejs/1.25.1',
            sdk_version: '1.25.1',
            auto_instrumentation: false,
          },
        },
        service: {
          version: 'unknown',
          runtime: 'nodejs',
          runtime_version: process.version.substring(1),
          name: 'test',
        },
        type: 'subsegment',
      },
      {
        id: expect.stringMatching(/^[a-f0-9]{16}$/),
        trace_id: traceId,
        name: 'GET /cause/throttle',
        start_time: expect.any(Number),
        end_time: expect.any(Number),
        parent_id: expect.stringMatching(/^[a-f0-9]{16}$/),
        error: true,
        throttle: true,
        http: {
          request: {
            method: 'GET',
            client_ip: '::1',
            x_forwarded_for: true,
            url: 'http://localhost:2999/cause/throttle/',
          },
          response: {
            status: 429,
          },
        },
        aws: {
          xray: {
            sdk: 'nodejs/1.25.1',
            sdk_version: '1.25.1',
            auto_instrumentation: false,
          },
        },
        service: {
          version: 'unknown',
          runtime: 'nodejs',
          runtime_version: process.version.substring(1),
          name: 'test',
        },
      },
    ]);
  });

  it('should show the correct segments when there are faults', async () => {
    const traceId = genTraceId();
    await request('http://localhost:2999/cause/fault')
      .get('/')
      .set('traceparent', `00-${traceId}-${genSpanId()}-01`)
      .expect(500);

    await new Promise((f) => setTimeout(f, 2500));
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
            sdk: 'nodejs/1.25.1',
            sdk_version: '1.25.1',
            auto_instrumentation: false,
          },
        },
        service: {
          version: 'unknown',
          runtime: 'nodejs',
          runtime_version: process.version.substring(1),
          name: 'test',
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
            sdk: 'nodejs/1.25.1',
            sdk_version: '1.25.1',
            auto_instrumentation: false,
          },
        },
        service: {
          version: 'unknown',
          runtime: 'nodejs',
          runtime_version: process.version.substring(1),
          name: 'test',
        },
        type: 'subsegment',
      },
      {
        id: expect.stringMatching(/^[a-f0-9]{16}$/),
        trace_id: traceId,
        name: 'request handler - /cause/fault',
        start_time: expect.any(Number),
        end_time: expect.any(Number),
        parent_id: expect.stringMatching(/^[a-f0-9]{16}$/),
        aws: {
          xray: {
            sdk: 'nodejs/1.25.1',
            sdk_version: '1.25.1',
            auto_instrumentation: false,
          },
        },
        service: {
          version: 'unknown',
          runtime: 'nodejs',
          runtime_version: process.version.substring(1),
          name: 'test',
        },
        type: 'subsegment',
      },
      {
        id: expect.stringMatching(/^[a-f0-9]{16}$/),
        trace_id: traceId,
        name: 'GET /cause/fault',
        start_time: expect.any(Number),
        end_time: expect.any(Number),
        parent_id: expect.stringMatching(/^[a-f0-9]{16}$/),
        fault: true,
        http: {
          request: {
            method: 'GET',
            client_ip: '::1',
            x_forwarded_for: true,
            url: 'http://localhost:2999/cause/fault/',
          },
          response: {
            status: 500,
          },
        },
        aws: {
          xray: {
            sdk: 'nodejs/1.25.1',
            sdk_version: '1.25.1',
            auto_instrumentation: false,
          },
        },
        service: {
          version: 'unknown',
          runtime: 'nodejs',
          runtime_version: process.version.substring(1),
          name: 'test',
        },
      },
    ]);
  });
});
