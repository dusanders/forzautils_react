import { ForzaTelemetryApi } from "ForzaTelemetryApi";
import { WebsocketRoutes } from "../routes.js";
import { randomKey } from "../utils.js";
import { SocketTopics, WebsocketUtils } from "./constants.js";
import { PlaybackRequest, SetRecordingRequest } from "./request.js";
import { ServerMessage } from "./message.js";

/**
 * Define the event emitter for Forza events
 */
export interface ForzaWebsocketEventEmitter {
  on<K extends keyof ForzaSocketEvents>(key: K, fn: (data: ForzaDataEvent) => void): ForzaEventSubscription;
}

export interface IForzaWebsocket extends ForzaWebsocketEventEmitter {
  requestReplay(request: PlaybackRequest): void;
  setRecordingState(state: boolean): void;
  start(): void;
  stop(): void;
}

//#region Helper Types

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
export class ForzaWebsocket implements IForzaWebsocket {
  /**
   * Maintain a singleton instance for WebSocket operations
   */
  private static singleton: ForzaWebsocket;

  /**
   * Factory method to return an instance of the WebSocket functionality
   * @returns ForzaWebsocket
   */
  static Open(): IForzaWebsocket {
    if (!ForzaWebsocket.singleton) {
      ForzaWebsocket.singleton = new ForzaWebsocket();
    }
    return ForzaWebsocket.singleton;
  }

  /**
   * Callback collection for event subscribers
   */
  private callbacks: event_callback_collection = {
    'close': [],
    'data': [],
    'open': [],
    'replay': []
  }

  /**
   * Reference to the WebSocket instance
   */
  private ws?: WebSocket;

  private constructor() {
    // Disallow - use factory method!
  }

  private emit<K extends keyof ForzaSocketEvents>(key: K, arg: ForzaSocketEvents[K]): void {
    this.callbacks[key].forEach((cb) => cb.callFn(arg))
  }

  setRecordingState(state: boolean): void {
    const request: SetRecordingRequest = {
      record: state
    };
    this.ws.send(JSON.stringify(request));
  }

  requestReplay(request: PlaybackRequest): void {
    this.ws.send(JSON.stringify(request));
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
      const message = JSON.parse(new TextDecoder().decode(ev.data)) as ServerMessage;
      switch (message.topic) {
        case SocketTopics.LiveData:
          const liveBuffer = message.data as ArrayBuffer;
          this.emit('data', { data: new ForzaTelemetryApi(liveBuffer.byteLength, liveBuffer) });
          break;
        case SocketTopics.Playback:
          const replayBuffer = message.data as ArrayBuffer;
          this.emit('replay', { data: new ForzaTelemetryApi(replayBuffer.byteLength, replayBuffer) });
          break;
        default: 
          console.log(`Unknown message: ${JSON.stringify(message)}`);
      }
    }
  }

  stop() {
    this.ws?.close();
  }
}