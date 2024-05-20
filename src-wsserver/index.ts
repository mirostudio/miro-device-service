import WebSocket from "ws";

class WsSession {
  readonly socket: WebSocket.WebSocket = null;
  onclose: Function = null;

  constructor(socket: WebSocket.WebSocket) {
    this.socket = socket;
  }

  setOnclose(onclose: Function) : void {
    this.onclose = onclose;
  }

  close() {
    this.socket.close();
  }

  public send(message: string) : void {
    this.socket.send(message);
  }

  public ping() : void {
    this.socket.ping("Hello-ping");
  }
}

class WsServer {
  wss: WebSocket.WebSocketServer | null = null;
  readonly sessions: Array<WsSession> = [];
  listening: boolean = false;

  constructor() {}

  private handleNewClient(socket: WebSocket.WebSocket) {
    console.log("New client connected.....");
    const session = new WsSession(socket);
    socket.addEventListener("close", (_event: WebSocket.CloseEvent) => {
      console.log("Client disconnected.....");
      const idx = this.sessions.indexOf(session);
      if (idx >= 0) {
        this.sessions.splice(idx, 0);
      }
    });
    //socket.addEventListener("message", (event: WebSocket.MessageEvent) => {
    //  console.log("[@from-client-0]: " + event.data);
    //});
    /*
    socket.on("message", (data: WebSocket.RawData) => {
      console.log("[@from-client@]: " + data.toString('utf8'));
    });
    */
    socket.on("message", (data) => {
      console.log("[@from-client@]: " + data);
    });
    this.sessions.push(session);
  }

  public broadcast(message: string) {
    for (const session of this.sessions) {
      session.send(message);
    }
  }

  public ping() : void {
    for (const session of this.sessions) {
      session.ping();
    }
  }

  private handleError(error: Error) : void {
    console.error(error);
  }

  async open() : Promise<void> {
    const subject = this;
    return new Promise((resolve, reject) => {
      console.log('creating ws ...');
      const wss = new WebSocket.WebSocketServer({
        port: 3001,
      });

      wss.on("listening", function listening() {
        subject.listening = true;
        resolve();
        console.log('WSS listening ... 🌼🌼🌼🌼🌼🌼');
      });

      wss.on("error", function error(error: Error) {
        console.error(error);
        // Any error before the server started listening is open error.
        if (!subject.listening) {
          reject(error);
        } else {
          subject.handleError(error);
        }
      });

      wss.on('connection', function connection(socket: WebSocket.WebSocket) {
        subject.handleNewClient(socket);
      });
      
      wss.on('close', function close() {
        console.log('WebSocket closed');
        subject.wss = null;
      });
    });
  }
}

async function main() {
  const w = new WsServer();
  await w.open();

  global.setInterval(async () => {
    const message = '@@ from WS-server: 🌼🌸🌷 @ ' + (new Date()).toLocaleTimeString();
    w.broadcast(message);
  }, 2 * 1000);
  global.setInterval(async () => {
    w.ping();
  }, 1000);
}

global.setImmediate(() => main());
