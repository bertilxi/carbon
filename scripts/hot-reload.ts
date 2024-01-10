let socket: WebSocket;
let reconnectionTimerId: NodeJS.Timeout;

const requestUrl = `${window.location.origin.replace("http", "ws")}`;

function log(message: string) {
  console.info("[refresh]", message);
}

function refresh() {
  window.location.reload();
}

function connect(callback: () => void = () => void 0) {
  if (socket) {
    socket.close();
  }

  socket = new WebSocket(requestUrl);
  socket.addEventListener("open", callback);
  socket.addEventListener("message", (event) => {
    if (event.data !== "refresh") {
      return;
    }
    log("refreshing...");
    refresh();
  });
  socket.addEventListener("close", () => {
    log("connection lost - reconnecting...");
    clearTimeout(reconnectionTimerId);
    reconnectionTimerId = setTimeout(() => {
      connect(refresh);
    }, 100);
  });
}

connect();
