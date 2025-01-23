import * as dgram from 'node:dgram';
import {
  ISubscribeForzaEvents,
  ForzaDataEventMap,
  ForzaEventSubscription,
  ForzaDataEmitter
} from '../types/ForzaDataEmitter';

export class ForzaUdpListener implements ISubscribeForzaEvents {
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

  on<K extends keyof ForzaDataEventMap>(key: K, fn: (data: ForzaDataEventMap[K]) => void): ForzaEventSubscription {
    return this.emitter.on(key, fn);
  }
  DEBUG() {
    setInterval(() => {
      this.emitter.emit('packet', Buffer.from(JSON.stringify({"test":"debug"})));
    }, 10);
  }

  private socketOpen() {
    console.log(`Socket did open`);
    this.DEBUG();
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