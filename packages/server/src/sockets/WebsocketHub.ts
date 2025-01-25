import { DISABLED, HttpRequest, HttpResponse, us_socket_context_t, WebSocket, WebSocketBehavior } from "uWebSockets.js";
import { IWebsocketInfo } from "../types/WebsocketInfo.js";
import { PublicSubscriptions } from "../types/Constants.js";
import { ByteEncoder } from "../utilities/ByteEncoder.js";

export class WebsocketHub {
  behavior: WebSocketBehavior<IWebsocketInfo> = {
    compression: DISABLED,
    maxLifetime: 0,
    maxBackpressure: 16 * 1024 * 1024,
    maxPayloadLength: 16 * 1024 * 1024,
    sendPingsAutomatically: true,
    open: this.open.bind(this),
    message: this.message.bind(this),
    upgrade: this.upgrade.bind(this),
    drain: this.drain.bind(this)
  }

  private open(ws: WebSocket<IWebsocketInfo>) {
    console.log(`websocket.open()`);
    ws.subscribe(PublicSubscriptions.ForzaData);
    ws.send(
      Buffer.from(
        JSON.stringify({ "type": "hello" })
      ),
      true
    );
  }

  private drain(ws: WebSocket<IWebsocketInfo>) {
    if (ws.getBufferedAmount() > this.behavior.maxBackpressure!) {
      console.log(`Socket has backpressure`);
    } else {
      console.log(`Socket has no backpressure`);
    }
  }

  private message(ws: WebSocket<IWebsocketInfo>, message: ArrayBuffer, isBinary: boolean) {
    console.log(`${JSON.stringify(ws.getUserData())} - ${ByteEncoder.decode(message)}`);
  }

  private upgrade(res: HttpResponse, req: HttpRequest, context: us_socket_context_t) {
    console.log(`websocket upgrade`);
    const userData: IWebsocketInfo = {
      connectUrl: req.getUrl(),
      key: req.getHeader('sec-websocket-key')
    }
    res.upgrade(
      userData,
      req.getHeader('sec-websocket-key'),
      req.getHeader('sec-websocket-protocol'),
      req.getHeader('sec-websocket-extensions'),
      context
    );
  }
}