import { WebsocketRoutes } from "./routes.js";
import { randomKey } from "./utils.js";

export interface ForzaDataEvent {
  buffer: ArrayBuffer;
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

export class ForzaWebsocket implements ForzaWebsocketEventEmitter {
  private callbacks: event_callback_collection = {
    'close': [],
    'data': [],
    'open': []
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
    const ws = new WebSocket(`ws://${WebsocketRoutes.baseUrl}${WebsocketRoutes.connect}`);
    ws.onopen = (ev) => {
      ws.send(JSON.stringify({ "type": "from React" }));
      this.emit('open', ev);
    }
    ws.onclose = (ev) => {
      this.emit('close', ev);
    }
    ws.onmessage = (ev) => {
      this.emit('data', { buffer: ev.data });
    }
  }
}