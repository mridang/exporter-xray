import * as dgram from 'node:dgram';
import {
  UDPDaemonSegmentEmitter,
  XrayTraceDataSegmentDocument,
} from '../../src';

jest.mock('node:dgram');

describe('udp.emitter test', () => {
  let mockSocket: dgram.Socket;

  beforeEach(() => {
    mockSocket = {
      send: jest.fn((_msg, _offset, _length, _port, _address, callback) => {
        callback(null); // Simulate successful send
      }),
      close: jest.fn(),
      unref: jest.fn(),
    } as unknown as dgram.Socket;

    (dgram.createSocket as jest.Mock).mockReturnValue(mockSocket);
    delete process.env.AWS_XRAY_DAEMON_ADDRESS;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default values', () => {
    process.env.AWS_XRAY_DAEMON_ADDRESS = '127.0.0.1:3000';
    new UDPDaemonSegmentEmitter(mockSocket);
    expect(dgram.createSocket).not.toHaveBeenCalled();
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
    new UDPDaemonSegmentEmitter(mockSocket);
    expect(dgram.createSocket).not.toHaveBeenCalled();
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
    const [message, , , port, address] = (mockSocket.send as jest.Mock).mock
      .calls[0];
    expect(port).toBe(2000);
    expect(address).toBe('127.0.0.1');
    expect(JSON.parse(message.toString().split('\n')[1]).name).toBe(
      'test-segment',
    );
  });
});
