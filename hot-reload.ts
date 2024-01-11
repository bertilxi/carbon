import type { Server } from "node:http";
import type WebSocket from "ws";
import { WebSocketServer } from "ws";

export const sockets = new Set<WebSocket>();

export function setupHotReload(server: Server) {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws) => {
    sockets.add(ws);

    ws.on("close", () => {
      ws.send("refresh");
      sockets.delete(ws);
    });
  });

  wss.on("error", console.error);

  for (const socket of sockets) {
    setImmediate(() => socket.send("refresh"));
  }
}
