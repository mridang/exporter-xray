/**
 * Tests for the UDP daemon segment emitter.
 * @file
 */

import { jest } from '@jest/globals';
import type { Socket } from 'node:dgram';
import type { DaemonSocket } from '../../src/emitter/udp.emitter.js';
import type { XrayTraceDataSegmentDocument } from '../../src/index.js';

let mockSocket: DaemonSocket & Pick<Socket, 'unref'>;
const createSocketMock = jest.fn(() => mockSocket);
const mockSend = jest.fn<DaemonSocket['send']>(
  (_msg, _offset, _length, _port, _address, onSent) => {
    onSent(null); // Simulate successful send
  },
);
const mockClose = jest.fn<DaemonSocket['close']>();
const mockUnref = jest.fn<Socket['unref']>();

// eslint-disable-next-line tslop/no-module-mocking -- proves the real node:dgram socket is never created when a socket is injected
jest.unstable_mockModule('node:dgram', () => ({
  createSocket: createSocketMock,
}));

const dgramMocked = await import('node:dgram');
const { UDPDaemonSegmentEmitter } = await import('../../src/index.js');

describe('udp.emitter test', () => {
  beforeEach(() => {
    mockSocket = { send: mockSend, close: mockClose, unref: mockUnref };

    createSocketMock.mockClear();
    createSocketMock.mockReturnValue(mockSocket);
    delete process.env.AWS_XRAY_DAEMON_ADDRESS;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default values', () => {
    process.env.AWS_XRAY_DAEMON_ADDRESS = '127.0.0.1:3000';
    const emitter = new UDPDaemonSegmentEmitter(mockSocket);
    expect(emitter).toBeInstanceOf(UDPDaemonSegmentEmitter);
    expect(dgramMocked.createSocket).not.toHaveBeenCalled();
    expect(mockUnref).not.toHaveBeenCalled();
  });

  it('should throw an error for invalid daemon address', () => {
    process.env.AWS_XRAY_DAEMON_ADDRESS = 'invalid-address';
    expect(() => new UDPDaemonSegmentEmitter(mockSocket)).toThrow(
      'Invalid Daemon Address. You must specify an IP and port.',
    );
  });

  it('should process AWS_XRAY_DAEMON_ADDRESS environment variable', () => {
    process.env.AWS_XRAY_DAEMON_ADDRESS = '127.0.0.1:3000';
    const emitter = new UDPDaemonSegmentEmitter(mockSocket);
    expect(emitter).toBeInstanceOf(UDPDaemonSegmentEmitter);
    expect(dgramMocked.createSocket).not.toHaveBeenCalled();
    expect(mockUnref).not.toHaveBeenCalled();
  });

  // eslint-disable-next-line tslop/no-call-only-assertions -- closing the injected socket is the only observable effect of shutdown
  it('should close the socket on shutdown', () => {
    process.env.AWS_XRAY_DAEMON_ADDRESS = '127.0.0.1:3000';
    const emitter = new UDPDaemonSegmentEmitter(mockSocket);
    emitter.shutdown();
    expect(mockUnref).not.toHaveBeenCalled();
    expect(mockClose).toHaveBeenCalled();
  });

  it('should emit trace data segments via UDP', async () => {
    const emitter = new UDPDaemonSegmentEmitter(mockSocket);
    const trace: XrayTraceDataSegmentDocument[] = [
      { id: '1', name: 'test-segment', start_time: 1, end_time: 2 },
    ];

    await emitter.emit(trace);

    expect(mockSend).toHaveBeenCalled();
    const { 0: message, 3: port, 4: address } = mockSend.mock.calls[0];
    expect(port).toBe(2000);
    expect(address).toBe('127.0.0.1');
    expect(
      (JSON.parse(message.toString().split('\n', 2)[1]) as { name: string })
        .name,
    ).toBe('test-segment');
  });
});
