import * as dgram from 'node:dgram';
import {
  ISubscribeUdpEvents,
  UdpDataEventMap,
  UdpEventSubscription,
  ForzaDataEmitter
} from '../types/ForzaDataEmitter.js';

export class IncomingUdpListener implements ISubscribeUdpEvents {
  private socket?: dgram.Socket;
  private emitter: ForzaDataEmitter = new ForzaDataEmitter();

  start(port: number) {
    const socket = dgram.createSocket('udp4');
    socket.once('error', this.bindError.bind(this))
      .once('listening', this.socketOpen.bind(this))
      .once('close', this.onClose.bind(this));
    socket.bind(port);
  }

  stop() {
    if (this.socket) {
      this.socket.close();
    }
  }

  on<K extends keyof UdpDataEventMap>(key: K, fn: (data: UdpDataEventMap[K]) => void): UdpEventSubscription {
    return this.emitter.on(key, fn);
  }

  /**
   * Debug method to send dummy packets, as if UDP had sent data
   */
  DEBUG() {
    setInterval(() => {
      this.emitter.emit('packet', Buffer.from(JSON.stringify({"test":"debug"})));
    }, 10);
  }

  private socketOpen() {
    console.log(`Socket did open`);
    // TODO - remove this debug
    // this.DEBUG();
    this.socket?.on('message', this.onMessage.bind(this));
  }

  private onMessage(buffer: Buffer<ArrayBufferLike>, rinfo: dgram.RemoteInfo) {
    this.emitter.emit('packet', buffer);
  }

  private bindError(error: Error) {
    console.error(`Failed to open socket: ${error.message}`);
  }

  private onClose() {
    console.log(`Socket closed!`);
  }
}