# forzautils_react
Forza Utility written in React

## System Architecture

The project is structured as a monorepo. We have 3 main projects: `server`, `frontend`, and `core`.

### Core

Encapsulates the core logic shared between the `server` and `frontend` projects.

Provides hooks and services for the `frontend` project to consume in the React app.

Provides DTO definitions for the `server` to send in response to REST calls.

### Frontend

React application using Vite as a packager.

### Server

Node, with Express and uWebSockets.js to provide functionality.