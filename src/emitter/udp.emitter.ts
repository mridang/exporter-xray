import { SegmentEmitter } from './segment.emitter';
import { XrayTraceDataSegmentDocument } from '../xray.document';
import * as dgram from 'node:dgram';

/**
 * UDP-based implementation of the SegmentEmitter interface that sends trace
 * data to the X-Ray daemon using UDP. It has been mercilessly cannibalised from
 * {@link https://github.com/aws/aws-xray-sdk-node/blob/aws-xray-sdk-node%403.9.0/packages/core/lib/segment_emitter.js}
 *
 * By default, segments are sent to localhost:2000, but you can configure this
 * using the `AWS_XRAY_DAEMON_ADDRESS` environment variable
 *
 * The X-Ray daemon is a software application that listens for traffic on
 * UDP port 2000 and relays trace data to the X-Ray service. It is always running
 * on Lambda and is faster as it uses a UDP-based transport.
 *
 * For more details, see the
 * {@link https://docs.aws.amazon.com/xray/latest/devguide/xray-daemon.html AWS X-Ray Daemon documentation}.
 */
export class UDPDaemonSegmentEmitter implements SegmentEmitter {
  private daemonConfig = {
    udp_ip: '127.0.0.1',
    udp_port: 2000,
  };

  /**
   * Constructs a new UDPDaemonSegmentEmitter.
   */
  constructor(private readonly socket = dgram.createSocket('udp4').unref()) {
    if (process.env.AWS_XRAY_DAEMON_ADDRESS) {
      this.processAddress(process.env.AWS_XRAY_DAEMON_ADDRESS);
    }
  }

  shutdown(): void {
    this.socket.close();
  }

  /**
   * Emits the provided trace data segments using UDP.
   * @param trace - The trace data segments to emit.
   */
  async emit(trace: XrayTraceDataSegmentDocument[]): Promise<void> {
    const formatted = trace.map(
      (segment) =>
        '{"format":"json","version":1}' + '\n' + JSON.stringify(segment),
    );

    for (const data of formatted) {
      await new Promise<void>((resolve, reject) => {
        const message = Buffer.from(data);
        this.socket.send(
          message,
          0,
          message.length,
          this.daemonConfig.udp_port,
          this.daemonConfig.udp_ip,
          (err) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          },
        );
      });
    }
  }

  /**
   * Processes and sets the daemon address from the provided address string.
   * @param address - The address string to process.
   * @throws Error if the address format is invalid.
   */
  private processAddress(address: string): void {
    if (address.indexOf(':') === -1) {
      throw new Error(
        'Invalid Daemon Address. You must specify an IP and port.',
      );
    }

    const splitAddress = address.split(' ');
    if (splitAddress.length === 1) {
      const addr = address.split(':');
      if (!addr[0]) {
        throw new Error('Invalid Daemon Address. You must specify an IP.');
      }
      this.daemonConfig.udp_ip = addr[0];
      this.daemonConfig.udp_port = parseInt(addr[1]);
    } else if (splitAddress.length === 2) {
      const part1 = splitAddress[0].split(':');
      const part2 = splitAddress[1].split(':');
      const addrMap: { [key: string]: string[] } = {};
      addrMap[part1[0]] = part1;
      addrMap[part2[0]] = part2;
      this.daemonConfig.udp_ip = addrMap['udp'][1];
      this.daemonConfig.udp_port = parseInt(addrMap['udp'][2]);
    }
  }
}
