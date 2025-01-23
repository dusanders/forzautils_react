import EventEmitter from "node:events";

export class ForzaEventSubscription {
  private remover: () => void;
  constructor(removeFn: () => void) {
    this.remover = removeFn;
  }
  remove(): void {
    this.remover();
  }
}

export interface IForzaDataEmitter {
  sendPacket(bytes: ArrayBuffer): void;
}

export interface ForzaDataEventMap {
  'packet': Buffer<ArrayBufferLike>;
}

export interface ISubscribeForzaEvents {
  on<K extends keyof ForzaDataEventMap>(key: K, fn: (data: ForzaDataEventMap[K]) => void): ForzaEventSubscription;
}

export interface IEmitForzaEvents {
  emit<K extends keyof ForzaDataEventMap>(key: K, arg: ForzaDataEventMap[K]): void;
}

export class ForzaDataEmitter implements ISubscribeForzaEvents, IEmitForzaEvents {
  private emitter: EventEmitter = new EventEmitter();

  on<K extends keyof ForzaDataEventMap>(key: K, fn: (data: ForzaDataEventMap[K]) => void): ForzaEventSubscription {
    this.emitter.on(key, fn);
    return new ForzaEventSubscription(() => {
      this.emitter.removeListener(key, fn)
    });
  }

  emit<K extends keyof ForzaDataEventMap>(key: K, arg: ForzaDataEventMap[K]): void {
    this.emitter.emit(key, arg);
  }
}