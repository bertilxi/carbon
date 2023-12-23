import type { Server } from "node:http";
import type WebSocket from "ws";
import { WebSocketServer } from "ws";

const sockets = new Set<WebSocket>();

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

  setTimeout(() => {
    for (const socket of sockets) {
      socket.send("refresh");
    }
  });
}
