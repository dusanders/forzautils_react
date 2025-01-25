import { ForzaTelemetryApi } from "ForzaTelemetryApi";
import { WebsocketRoutes } from "./routes.js";
import { randomKey } from "./utils.js";

export interface ForzaDataEvent {
  data: ForzaTelemetryApi;
}

export interface ForzaSocketEvents {
  'open': Event;
  'close': Event;
  'data': ForzaDataEvent;
}

export class ForzaEventSubscription {
  private remover: (id: string) => void;
  private id: string = randomKey();
  constructor(remover: (id: string) => void) {
    this.remover = remover;
  }
  remove() {
    this.remover(this.id);
  }
}

export interface ForzaWebsocketEventEmitter {
  on<K extends keyof ForzaSocketEvents>(key: K, fn: (data: ForzaDataEvent) => void): ForzaEventSubscription;
}

//#region Helper Types

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

type event_callback_collection = {
  [key in keyof ForzaSocketEvents]: event_subscriber[];
};

type forza_event_cb = ((data: ForzaDataEvent) => void) | ((data: ForzaDataEvent | Event) => void);

//#endregion

export class ForzaWebsocket implements ForzaWebsocketEventEmitter {
  private static singleton: ForzaWebsocket;
  static Open(): ForzaWebsocket {
    if(!ForzaWebsocket.singleton) {
      ForzaWebsocket.singleton = new ForzaWebsocket();
    }
    return ForzaWebsocket.singleton;
  }

  private callbacks: event_callback_collection = {
    'close': [],
    'data': [],
    'open': []
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
    if(!this.ws) {
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
      this.emit('data', { data: new ForzaTelemetryApi(ev.data.byteLength, ev.data) });
    }
  }

  stop() {
    this.ws?.close();
  }
}