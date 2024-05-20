import WebSocket from "ws";

class WsSession {
  readonly socket: WebSocket.WebSocket = null;
  onclose: Function = null;
  timeoutId: NodeJS.Timeout = null;

  constructor(socket: WebSocket.WebSocket) {
    this.socket = socket;
    this.timeoutId = global.setTimeout(() => {
      this.socket.ping();
    }, 5 * 1000);
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

  public ping(data: string) : void {
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.ping(data);
    }
  }

  public onPong(data: Buffer) : void {
    const _this = this;
    const txt = data.toString("utf8");
    console.log("🌷 🌷 🌷 [pong-received-in-server] : " + txt);
    if (this.socket.readyState !== WebSocket.OPEN) {
      this.timeoutId = null;
      return;
    }
    // Start another ping.
    this.timeoutId = global.setTimeout(() => {
      _this.ping("next-ping");
    }, 5 * 1000);
  }

  public onDispose() : void {
    if (this.timeoutId !== null) {
      global.clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    console.log("on Dispose .....");
  }

  public onMessage(data: WebSocket.RawData) : void {
    console.log("[@msg-from-client@]: " + data);
  }
}

//-------------------------------------------------------------------
class WsServer {
  wss: WebSocket.WebSocketServer | null = null;
  readonly sessions: Array<WsSession> = [];
  listening: boolean = false;

  constructor() {}

  private handleNewClient(socket: WebSocket.WebSocket) {
    console.log("New client connected.....");
    const session = new WsSession(socket);
  
    socket.addEventListener("close", (_event: WebSocket.CloseEvent) => {
      session.onDispose();
      const idx = this.sessions.indexOf(session);
      if (idx >= 0) {
        this.sessions.splice(idx, 0);
      }
    });
    // Here socket.on("open") is alreadyy called.
    socket.on("message", session.onMessage.bind(session));
    socket.on("pong", session.onPong.bind(session));
    this.sessions.push(session);
    if (this.sessions.length > 1) {
      console.warn("Got two simultaneous clients, which is unexpected.");
    }
  }

  public broadcast(message: string) {
    for (const session of this.sessions) {
      session.send(message);
    }
  }

  public async open() : Promise<void> {
    const subject = this;
    return new Promise((resolve, reject) => {
      console.log('creating ws ...');
      const wss = new WebSocket.WebSocketServer({
        port: 3001,
      });

      wss.on("listening", function listening() {
        subject.wss = wss;
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

  public shutdownAsync() : Promise<void> {
    for (const session of this.sessions) {
      session.close();
    }
    if (this.wss === null) {
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      this.wss.close((err?: Error) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  private handleError(error: Error) : void {
    console.error(error);
  }
}

//-------------------------------------------------------------------
let wserver: WsServer = null;

async function main() {
  wserver = new WsServer();
  await wserver.open();

  global.setInterval(async () => {
    const message = '🌸 🌸 🌸 [from server]: ' + (new Date()).toLocaleTimeString();
    wserver.broadcast(message);
  }, 2 * 1000);
}

process.on('SIGINT', async function() {
  console.log("Caught interrupt signal");
  if (wserver) {
    await wserver.shutdownAsync();
  }
  process.exit(1);
});

global.setImmediate(() => main());
