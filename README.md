# forzautils_react
Forza Utility written in React

## System Architecture

The project is structured as a monorepo. We have 3 main projects: `server`, `frontend`, and `core`.

### Core

Encapsulates the core logic shared between the `server` and `frontend` projects.

Provides hooks and services for the `frontend` project to consume in the React app.

Provides DTO definitions for the `server` to send in response to REST calls.

Primary exports: `Api` and `ForzaWebsocket`

#### *_Api_*

Exposes methods for fetching data via HTTP, either REST or GraphQL.

```javascript
/** 
 * Example fetching WiFi info from server to properly forward telemetry data from in-game. 
 **/
const api = await new Api().wifiApi.getIpInfoQL();
const ip = api.data.ip;
const port = api.data.listenPort;
```

#### *_IForzaWebsocket_*

Exposes functionality to control and subscribe to WebSocket events from the server. Retains a singleton instance and uses a factory static method for instance getting.

```javascript
/**
 * Example opening, listen for a data packet, and then closing the WebSocket
 **/
const websocket = ForzaWebsocket.Open();
const dataSub = websocket.on('data', (data) => {
  console.log(`forza data: ${JSON.stringify(data)}`);
  dataSub.remove();
  websocket.stop();
});
websocket.start();
```

### Frontend

React application using Vite as a packager.

### Server

Node, with Express and uWebSockets.js to provide functionality.

A touch of GraphQL to fetch data.

Server exposes its local network IP and the configured Port open to receive Forza telemetry data. Use this information to forward DASH telemetry to the server.

Internally, the server opens a Datagram socket on the ip and port configured; it then forwards that data to the WebSocket server which sends the data to the `forza-data` subscribers. Every connection is considered to be a part of the `forza-data` group to receive live data messages.