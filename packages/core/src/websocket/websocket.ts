import { ForzaTelemetryApi } from "ForzaTelemetryApi";
import { WebsocketRoutes } from "../routes.js";
import { randomKey } from "../utils.js";
import { SocketTopics, WebsocketUtils } from "./constants.js";

/**
 * Define the Forza data events
 */
export interface ForzaDataEvent {
  data: ForzaTelemetryApi;
}

/**
 * Define the available events
 */
export interface ForzaSocketEvents {
  'open': Event;
  'close': Event;
  'data': ForzaDataEvent;
  'replay': ForzaDataEvent;
}

/**
 * Utility class to encapsulate the Event subscriptions
 */
export class ForzaEventSubscription {
  /**
   * Function to remove the subscription from the collection.
   * 
   * NOTE: should only be set by the event emitter implementor
   */
  private remover: (id: string) => void;
  /**
   * Random key to identify the subscription
   */
  private id: string = randomKey();
  constructor(remover: (id: string) => void) {
    this.remover = remover;
  }
  /**
   * Remove and close the subscription
   */
  remove() {
    this.remover(this.id);
  }
}

/**
 * Define the event emitter for Forza events
 */
export interface ForzaWebsocketEventEmitter {
  on<K extends keyof ForzaSocketEvents>(key: K, fn: (data: ForzaDataEvent) => void): ForzaEventSubscription;
}

//#region Helper Types

/**
 * Class to encapsulate the event subscribers
 */
class event_subscriber {
  id: string = randomKey();
  private fn: forza_event_cb;
  constructor(fn: forza_event_cb) {
    this.fn = fn;
  }
  callFn(data: ForzaDataEvent | Event): void {
    this.fn(data as any);
  }
}

/**
 * Specify the required event subscriptions arrays
 */
type event_callback_collection = {
  [key in keyof ForzaSocketEvents]: event_subscriber[];
};

/**
 * Specify the callback signature for the forza data events
 */
type forza_event_cb = ((data: ForzaDataEvent) => void) | ((data: ForzaDataEvent | Event) => void);

//#endregion

/**
 * Class to encapsulate the Forza websocket events
 */
export class ForzaWebsocket implements ForzaWebsocketEventEmitter {
  private static singleton: ForzaWebsocket;
  static Open(): ForzaWebsocket {
    if (!ForzaWebsocket.singleton) {
      ForzaWebsocket.singleton = new ForzaWebsocket();
    }
    return ForzaWebsocket.singleton;
  }

  private callbacks: event_callback_collection = {
    'close': [],
    'data': [],
    'open': [],
    'replay': []
  }
  private ws?: WebSocket;

  private constructor() {
    // Disallow - use factory method!
  }

  private emit<K extends keyof ForzaSocketEvents>(key: K, arg: ForzaSocketEvents[K]): void {
    this.callbacks[key].forEach((cb) => cb.callFn(arg))
  }

  on<K extends keyof ForzaSocketEvents>(key: K, fn: (data: ForzaDataEvent) => void): ForzaEventSubscription {
    const sub = new event_subscriber(fn);
    this.callbacks[key].push(sub);
    return new ForzaEventSubscription((id) => {
      this.callbacks[key] = this.callbacks[key].filter((i) => i.id !== id);
    });
  }

  start() {
    if (!this.ws) {
      this.ws = new WebSocket(`${WebsocketRoutes.baseUrl}${WebsocketRoutes.connect}`);
    }
    this.ws.binaryType = 'arraybuffer';
    this.ws.onopen = (ev) => {
      this.ws?.send(JSON.stringify({ "type": "from React" }));
      this.emit('open', ev);
    }
    this.ws.onclose = (ev) => {
      this.emit('close', ev);
    }
    this.ws.onmessage = (ev: MessageEvent<ArrayBuffer>) => {
      const topic =  WebsocketUtils.byteToTopic(ev.data.slice(0, 1)[0]);
      switch (topic) {
        case SocketTopics.LiveData:
          this.emit('data', { data: new ForzaTelemetryApi(ev.data.byteLength, ev.data) });
          break;
        case SocketTopics.Playback:
          this.emit('replay', { data: new ForzaTelemetryApi(ev.data.byteLength, ev.data) });
          break;
      }
    }
  }

  stop() {
    this.ws?.close();
  }
}