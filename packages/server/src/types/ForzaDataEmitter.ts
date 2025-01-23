import EventEmitter from "node:events";

/**
 * Subscription to an event. Convenience object that
 * exposes a simple remove() method to clean up listener.
 */
export class UdpEventSubscription {
  private remover: () => void;
  constructor(removeFn: () => void) {
    this.remover = removeFn;
  }
  remove(): void {
    this.remover();
  }
}

/**
 * Typing definition to type the events from the UDP stream
 */
export interface UdpDataEventMap {
  /**
   * 'packet' events will receive a Buffer<ArrayBufferLike>
   */
  'packet': Buffer<ArrayBufferLike>;
}

/**
 * Define the functionality of the UDP implementing class that allows
 * callers to subscribe to UDP events
 */
export interface ISubscribeUdpEvents {
  /**
   * Subscribe to UDP events. Returns an object that exposes a 'remove()' 
   * function for cleanup.
   * @param key Event to receive
   * @param fn Callback handler function
   */
  on<K extends keyof UdpDataEventMap>(key: K, fn: (data: UdpDataEventMap[K]) => void): UdpEventSubscription;
}

/**
 * Define the functionality of the UDP implementing class to enforces
 * the proper event and args are emitted from the underlying EventEmitter
 */
export interface IEmitUdpEvents {
  /**
   * Emit a UDP event
   * @param key Event to emit
   * @param arg Argument to send
   */
  emit<K extends keyof UdpDataEventMap>(key: K, arg: UdpDataEventMap[K]): void;
}

/**
 * Class to override default EventEmitter to allow enforced types over the default
 * EventEmitter
 */
export class ForzaDataEmitter implements ISubscribeUdpEvents, IEmitUdpEvents {
  /**
   * Base EventEmitter
   */
  private emitter: EventEmitter = new EventEmitter();

  on<K extends keyof UdpDataEventMap>(key: K, fn: (data: UdpDataEventMap[K]) => void): UdpEventSubscription {
    this.emitter.on(key, fn);
    return new UdpEventSubscription(() => {
      this.emitter.removeListener(key, fn)
    });
  }

  emit<K extends keyof UdpDataEventMap>(key: K, arg: UdpDataEventMap[K]): void {
    this.emitter.emit(key, arg);
  }
}