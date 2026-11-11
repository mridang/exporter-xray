/**
 * Tests for the UDP daemon segment emitter.
 * @file
 */

import { jest } from '@jest/globals';
import type { Socket } from 'node:dgram';
import type { XrayTraceDataSegmentDocument } from '../../src';

let mockSocket: Socket;
const createSocketMock = jest.fn(() => mockSocket);

jest.unstable_mockModule('node:dgram', () => ({
  createSocket: createSocketMock,
}));

const dgramMocked = await import('node:dgram');
const { UDPDaemonSegmentEmitter } = await import('../../src');

describe('udp.emitter test', () => {
  beforeEach(() => {
    mockSocket = {
      send: jest.fn((_msg, _offset, _length, _port, _address, onSent) => {
        onSent(null); // Simulate successful send
      }),
      close: jest.fn(),
      unref: jest.fn(),
    } as unknown as Socket;

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
    expect(mockSocket.unref).not.toHaveBeenCalled();
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
    expect(mockSocket.unref).not.toHaveBeenCalled();
  });

  it('should close the socket on shutdown', () => {
    process.env.AWS_XRAY_DAEMON_ADDRESS = '127.0.0.1:3000';
    const emitter = new UDPDaemonSegmentEmitter(mockSocket);
    emitter.shutdown();
    expect(mockSocket.unref).not.toHaveBeenCalled();
    expect(mockSocket.close).toHaveBeenCalled();
  });

  it('should emit trace data segments via UDP', async () => {
    const emitter = new UDPDaemonSegmentEmitter(mockSocket);
    const trace: XrayTraceDataSegmentDocument[] = [
      { id: '1', name: 'test-segment', start_time: 1, end_time: 2 },
    ];

    await emitter.emit(trace);

    expect(mockSocket.send).toHaveBeenCalled();
    const {
      0: message,
      3: port,
      4: address,
    } = (mockSocket.send as jest.Mock).mock.calls[0];
    expect(port).toBe(2000);
    expect(address).toBe('127.0.0.1');
    expect(JSON.parse(message.toString().split('\n', 2)[1]).name).toBe(
      'test-segment',
    );
  });
});
